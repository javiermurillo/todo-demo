## Resumen

Una o dos frases describiendo el cambio desde la perspectiva del
usuario final. No repetir el título.

## Cambios por archivo

Lista exacta de archivos modificados o añadidos, agrupados por
propósito. Ejemplo:

- `assets/app.js` — factory `createItem` único sitio para
  `data-testid` dinámicos.
- `assets/style.css` — palette tokens en `:root`.
- `index.html` — carga Press Start 2P, deferred `assets/app.js`.
- `tests/todo.spec.mjs` — 17 Playwright cases.

## Validación

Comandos exactos que el revisor puede correr para reproducir el
estado verde. Ejemplo:

```bash
npx playwright install chromium
npx playwright test
openspec validate <change-id> --strict
```

Incluir conteo de tests y duración esperada.

## Scope declarado

Lista explícita de archivos que el PR toca. Cualquier archivo fuera
de esta lista debe justificarse o sacarse en un commit aparte.
Reglas de drive-by: `git diff --stat origin/main..HEAD` debe
coincidir con esta lista.

## Dependencias

- ¿Este change depende de otro merge? (e.g. "Bloquea la rama
  feat/<otro>")
- ¿Otro change depende de este? (e.g. "C1.b depende de este PR;
  C1.c depende de C1.b")

Si no hay dependencias, escribir explícitamente "Sin dependencias".

## Checklist del revisor

- [ ] `openspec validate <change-id> --strict` verde.
- [ ] `npx playwright test` verde (todos los casos).
- [ ] `git diff --stat origin/main..HEAD` coincide con Scope
      declarado.
- [ ] Sin commits drive-by (`git log --format='%h %s' origin/main..HEAD`
      solo muestra trabajo del change).
- [ ] Sin `Co-Authored-By:` ni footer `🤖 Generated with ...`.
- [ ] Conventional Commits con scope `todo-demo`.
- [ ] Tras merge: ejecutar `openspec archive <change-id>`.