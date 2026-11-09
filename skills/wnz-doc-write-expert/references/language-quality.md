# Language quality: pitfalls and examples

Read this file with the sentence and paragraph checks in `SKILL.md` before
writing in a language covered below. The examples show failure patterns, not
facts to reuse. Identifiers stay unchanged in every version. Repository
glossaries and established corpus terms take precedence over the term choices
suggested here.

## Common failure patterns

| Pattern | Symptom |
| --- | --- |
| Telegraphic notes | Missing articles and verbs; colons, slashes or arrows used as verbs |
| Calque | English word order or idiom rendered word for word |
| Bare short names | `dev`, `prd`, `stg` used as ordinary words |
| Fact list | Sentences that share a topic but have no connectives |
| Ambiguous referent | Pronoun or implicit subject with two possible antecedents |
| Loanword drift | The same concept called by an English and a local term |
| Plausible inference | A fluent "because", "only" or "without interruption" absent from the evidence |
| Meta-text | The document talks about its notes, sources or rewriting |

## Italian

- Use the article before nouns, including technical ones: "il repository", "lo
  stack `prd`", "la registry", "gli output".
- Write procedures with the impersonal infinitive ("Verificare", "Eseguire")
  and keep it consistent within one document.
- Prefer "il codice" or "la configurazione nel repository" to "il sorgente".
- Distinguish an artifact from an operation when English uses one word: for an
  OpenTofu plan, "il piano" is the artifact; "l'apply" or "applicare le
  modifiche" is the operation.
- Avoid "andare a" + infinitive ("andare a modificare") and "in termini di".

| Avoid | Write |
| --- | --- |
| Ogni modifica architetturale: dichiarare decisione, aggiornare documento. | Ogni modifica architetturale richiede di dichiarare la decisione e di aggiornare il documento. |
| Dopo modifiche: `make check`. | Dopo ogni modifica, eseguire `make check`. |
| Il flag è attivo solo in prd; dev/stg restano `false`. | Il flag è attivo soltanto nello stack `prd`; negli stack `dev` e `stg` resta `false`. |
| Backup giornaliero, retention 7 giorni, restore testato mensilmente. | Il backup viene eseguito ogni giorno e conservato per 7 giorni; il ripristino viene provato una volta al mese. |
| Il plugin gli invia un byte in più. | Il plugin invia al motore AppSec un byte in più rispetto alla soglia. |

## Spanish

- Keep articles and use one procedure form consistently: the infinitive
  ("Verificar", "Ejecutar") or the imperative the corpus already uses.
- Prefer established equivalents to unnecessary anglicisms: "desplegar",
  "credenciales", "rotar la contraseña".
- Avoid gerund chains ("configurando, verificando y actualizando") and the
  passive with "ser" where Spanish uses "se" ("se publica", not "es publicado").

| Avoid | Write |
| --- | --- |
| Creds en Coolify; no poner valores en compose/commits. | Las credenciales se guardan en Coolify. No incluya sus valores en el archivo Compose ni en los commits. |

## French

- Keep articles and the full negation ("ne ... pas"); use the infinitive for
  procedures ("Vérifier", "Exécuter").
- Prefer "déployer", "mot de passe" and "jeton" to unnecessary English terms;
  keep a loanword such as "conteneur" or "container" as the corpus does.

## German

- Keep compound nouns readable; split a very long compound with a hyphen or a
  phrase. Use the imperative with "Sie" or the infinitive consistently.
- Place verbs correctly in subordinate clauses instead of keeping English clause
  order.
