# Language quality: pitfalls and examples

Read the section for the target language together with the sentence and
paragraph checks in [language-and-register.md](language-and-register.md). The
examples show failure patterns, not facts to reuse; each rewrite adds no fact
absent from its source and its context. Identifiers stay unchanged. Repository
glossaries and established corpus terms take precedence over the term choices
suggested here.

## Italian

- Use the article before nouns, including technical ones: "il repository", "lo
  script", "gli output". When the gender of a loanword varies, follow the
  corpus.
- Write procedures with the impersonal infinitive ("Verificare", "Eseguire"),
  or the form the corpus already uses, and keep it consistent in a document.
- "Il sorgente" is accepted usage; when the corpus also says "il codice", keep
  one term.
- When English uses one word for an artifact and an operation, name them
  separately: for example "la build" for the artifact and "compilare" for the
  operation.
- Avoid "andare a" + infinitive ("andare a modificare") and "in termini di".

| Avoid | Write |
| --- | --- |
| Ogni modifica architetturale: dichiarare decisione, aggiornare documento. | Ogni modifica architetturale richiede di dichiarare la decisione e di aggiornare il documento. |
| Dopo modifiche: `make check`. | Dopo le modifiche, eseguire `make check`. |
| Cache attiva solo su main; feature/* senza cache. | La cache è attiva soltanto sul ramo `main`; i rami `feature/*` non la usano. |
| Log ruotati ogni notte, conservati 14 giorni, poi cancellati. | I log vengono ruotati ogni notte, conservati per 14 giorni e poi cancellati. |
| (Contesto: il plugin inoltra il corpo al motore AppSec.) Il plugin gli invia un byte in più. | Il plugin invia al motore AppSec un byte in più. |

## Spanish

- Keep articles and use one procedure form consistently: the infinitive
  ("Verificar", "Ejecutar") or the imperative the corpus already uses.
- Prefer established equivalents to unnecessary anglicisms when the corpus has
  no established English term: "desplegar", "almacenar en caché".
- Avoid gerund chains ("configurando, verificando y actualizando") and the
  passive with "ser" where Spanish uses "se" ("se publica", not "es publicado").

| Avoid | Write |
| --- | --- |
| Cache TTL 10 min; purgar tras deploy. | La caché tiene un TTL de 10 minutos. Purgarla después del despliegue. |

## French

- Keep articles and the full negation ("ne ... pas"); use the infinitive
  ("Vérifier") or the imperative ("Vérifiez") for procedures, as the corpus
  does, and keep it consistent.
- Prefer native terms such as "déployer", "mot de passe", "jeton" and
  "conteneur" unless the corpus has established an English term.

## German

- Keep compound nouns readable; split a very long compound with a hyphen or a
  phrase. Use the imperative with "Sie" or the infinitive consistently.
- Place verbs correctly in subordinate clauses instead of keeping English clause
  order.
