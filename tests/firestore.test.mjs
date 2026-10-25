import { readFile } from "node:fs/promises";
import { before, after, beforeEach, test } from "node:test";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, writeBatch, serverTimestamp } from "firebase/firestore";

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-turing-store",
    firestore: { rules: await readFile(new URL("../firestore.rules", import.meta.url), "utf8") }
  });
});
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, "usuarios/admin"), { nombre: "Admin", rol: "admin" });
    await setDoc(doc(db, "usuarios/cliente"), { nombre: "Cliente", rol: "cliente" });
    for (let i = 0; i < 9; i++) {
      await setDoc(doc(db, "productos/p" + i), {
        nombre: "Producto " + i, categoria: "Audio", precio: 100,
        stock: 20, disponible: true
      });
    }
    await setDoc(doc(db, "pedidos/anterior"), {
      usuarioId: "cliente", productos: [{ productoId: "p0", cantidad: 2, precio: 100 }]
    });
  });
});

function compra({ n = 1, id = "nuevo", cantidad = 2, total, precio = 100,
                  sinPedido = false, sinStock = false, duplicado = false,
                  stock = 18, usuarioId = "cliente", subtotal, nombre } = {}) {
  const db = env.authenticatedContext("cliente").firestore();
  const batch = writeBatch(db);
  const productos = Array.from({ length: n }, (_, i) => ({
    productoId: "p" + (duplicado ? 0 : i),
    nombre: nombre ?? "Producto " + (duplicado ? 0 : i),
    cantidad, precio, subtotal: subtotal ?? precio * cantidad
  }));
  if (!sinStock) productos.forEach((item, indicePedido) => {
    batch.update(doc(db, "productos/" + item.productoId), {
      stock, disponible: stock > 0, actualizadoEn: serverTimestamp(),
      ultimoPedidoId: id, indicePedido
    });
  });
  if (!sinPedido) batch.set(doc(db, "pedidos/" + id), {
    numeroPedido: "TS-PRUEBA", usuarioId, usuarioCorreo: "cliente@example.test",
    productos, total: total ?? precio * cantidad * n,
    fecha: serverTimestamp(), estado: "confirmado",
    pago: { metodo: "efectivo", nombreMetodo: "Efectivo al retirar", estado: "pendiente", referencia: "TEST" }
  });
  return batch.commit();
}

test("catálogo público; visitante no modifica stock", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, "productos/p0")));
  await assertFails(updateDoc(doc(db, "productos/p0"), { stock: 0 }));
});
test("cliente no crea productos ni cambia precio", async () => {
  const db = env.authenticatedContext("cliente").firestore();
  await assertFails(setDoc(doc(db, "productos/nuevo"), { nombre: "Otro" }));
  await assertFails(updateDoc(doc(db, "productos/p0"), { precio: 1 }));
});
test("administrador puede crear y editar productos", async () => {
  const db = env.authenticatedContext("admin").firestore();
  await assertSucceeds(setDoc(doc(db, "productos/nuevo"), { nombre: "Otro" }));
  await assertSucceeds(updateDoc(doc(db, "productos/p0"), { precio: 120 }));
});
test("cliente no se asigna admin", async () => {
  const db = env.authenticatedContext("cliente").firestore();
  await assertFails(updateDoc(doc(db, "usuarios/cliente"), { rol: "admin" }));
});
test("pedido propio visible; ajeno bloqueado", async () => {
  await assertSucceeds(getDoc(doc(env.authenticatedContext("cliente").firestore(), "pedidos/anterior")));
  await assertFails(getDoc(doc(env.authenticatedContext("otro").firestore(), "pedidos/anterior")));
});
test("compra válida de un producto", () => assertSucceeds(compra()));
test("compra válida de ocho productos distintos", () => assertSucceeds(compra({ n: 8 })));
test("rechaza nueve productos distintos", () => assertFails(compra({ n: 9 })));
test("rechaza descuento sin pedido", () => assertFails(compra({ sinPedido: true })));
test("rechaza pedido sin descuento", () => assertFails(compra({ sinStock: true })));
test("rechaza reutilizar un pedido anterior", () => assertFails(compra({ id: "anterior" })));
test("rechaza total alterado", () => assertFails(compra({ total: 1 })));
test("rechaza precio alterado", () => assertFails(compra({ precio: 1 })));
test("rechaza cantidad negativa", () => assertFails(compra({ cantidad: -2 })));
test("rechaza cantidad decimal", () => assertFails(compra({ cantidad: 1.5 })));
test("rechaza descuento que no coincide con cantidad", () => assertFails(compra({ stock: 0 })));
test("rechaza productos duplicados", () => assertFails(compra({ n: 2, duplicado: true })));
test("rechaza pedido a nombre de otro usuario", () => assertFails(compra({ usuarioId: "otro" })));

test("rechaza subtotal alterado aunque coincida con el total", () => assertFails(compra({ subtotal: 1, total: 1 })));
test("rechaza nombre de producto alterado", () => assertFails(compra({ nombre: "Nombre falso" })));

