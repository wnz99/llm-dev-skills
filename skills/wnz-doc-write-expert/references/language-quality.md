# Language quality: pitfalls and examples

Read the section for the target language together with the sentence and
paragraph checks in `SKILL.md`. The examples show failure patterns, not facts
to reuse, and each rewrite keeps exactly the facts of its source. Identifiers
stay unchanged. Repository glossaries and established corpus terms take
precedence over the term choices suggested here.

## Italian

- Use the article before nouns, including technical ones: "il repository", "lo
  stack `prd`", "gli output". For loanwords whose gender varies, such as
  "il/la registry", follow the corpus.
- Write procedures with the impersonal infinitive ("Verificare", "Eseguire"),
  or the form the corpus already uses, and keep it consistent in a document.
- Prefer "il codice" or "la configurazione" to "il sorgente" for source code.
- When English uses one word for an artifact and an operation, name them
  separately: for example "il piano" for a saved plan and "applicare le
  modifiche" for the operation.
- Avoid "andare a" + infinitive ("andare a modificare") and "in termini di".

| Avoid | Write |
| --- | --- |
| Ogni modifica architetturale: dichiarare decisione, aggiornare documento. | Ogni modifica architetturale richiede di dichiarare la decisione e di aggiornare il documento. |
| Dopo modifiche: `make check`. | Dopo ogni modifica, eseguire `make check`. |
| Il flag è attivo solo in prd; dev/stg restano `false`. | Il flag è attivo soltanto nello stack `prd`; negli stack `dev` e `stg` resta `false`. |
| Log ruotati ogni notte, conservati 14 giorni, poi cancellati. | I log vengono ruotati ogni notte, conservati per 14 giorni e poi cancellati. |
| Il plugin gli invia un byte in più. | Il plugin invia al motore AppSec un byte in più. |

## Spanish

- Keep articles and use one procedure form consistently: the infinitive
  ("Verificar", "Ejecutar") or the imperative the corpus already uses.
- Prefer established equivalents to unnecessary anglicisms: "desplegar",
  "credenciales", "rotar la contraseña".
- Avoid gerund chains ("configurando, verificando y actualizando") and the
  passive with "ser" where Spanish uses "se" ("se publica", not "es publicado").

| Avoid | Write |
| --- | --- |
| Token en vault; no ponerlo en scripts/tickets. | El token se guarda en el gestor de secretos. No incluya el valor del token en los scripts ni en los tickets. |

## French

- Keep articles and the full negation ("ne ... pas"); use the infinitive for
  procedures ("Vérifier", "Exécuter").
- Prefer native terms such as "déployer", "mot de passe", "jeton" and
  "conteneur" unless the corpus has established an English term.

## German

- Keep compound nouns readable; split a very long compound with a hyphen or a
  phrase. Use the imperative with "Sie" or the infinitive consistently.
- Place verbs correctly in subordinate clauses instead of keeping English clause
  order.
