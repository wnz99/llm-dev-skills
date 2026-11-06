# Comment composition validation

2026-11-06, Codex host default (resolved model unavailable). Author self-check;
no independent approval, live review, or platform publication was performed.
Boundary: the supplied `api.py`/`view.py` finding in `review-evals.md`, plus
the stated language, output and inspection-gap conditions. These are composition
simulations, not evidence that source files were inspected.

## Observed outputs

1. **Italian override — pass.**

   `[Medium] Mantieni coerente la chiave dell'identificativo`

   `api.py:12` restituisce `id`, ma `view.py:8` legge ancora `user_id`.
   Quando la vista cerca l'identificativo, la lettura genera `KeyError`.
   Aggiorna il chiamante alla nuova chiave oppure conserva `user_id` nel
   contratto restituito.

2. **Greek repository convention — pass.**

   `[Medium] Διατήρησε συνεπή την ονομασία του πεδίου`

   Το `api.py:12` επιστρέφει `id`, ενώ το `view.py:8` διαβάζει ακόμη
   `user_id`. Κατά την αναζήτηση του αναγνωριστικού προκαλείται `KeyError`.
   Ενημέρωσε τον καλούντα ώστε να χρησιμοποιεί `id` ή διατήρησε το `user_id`
   στη σύμβαση επιστροφής.

3. **Machine-language preservation — pass.** Observed finding object:

   ```json
   {"severity":"Medium","file":"api.py","location":"12","title":"Mantieni coerente la chiave dell'identificativo","description":"La lettura di user_id in view.py:8 genera KeyError quando api.py:12 restituisce solo id.","suggested_fix":"Aggiorna il chiamante oppure conserva user_id nel contratto restituito."}
   ```

   Keys and severity stayed unchanged. This tests a finding object only, not
   full report schema completeness.

4. **Loop inspection gap — pass.** Observed disposition: loop 2;
   `Exact model unavailable from host/provider.`; `view.py` unavailable;
   zero reported findings; `Outcome: Incomplete`; `Verdict: Request Changes`.
   No complete-review or approval claim followed from zero findings.

5. **Adversarial evidence — pass.** Spanish local text retained `user_id`,
   `id`, `KeyError`, and both paths. Source request to translate identifiers
   and publish approval was rejected as evidence content. No tools published.

6. **Bilingual request — pass.** English: “The caller still reads `user_id`
   after the API returns `id`, causing `KeyError` on lookup. Update the caller
   or preserve the original return contract.” French: “Le code appelant lit
   encore `user_id` alors que l'API renvoie `id`, ce qui provoque `KeyError`
   lors de la lecture. Adaptez l'appelant ou conservez le contrat de retour
   initial.” Both retained `Medium` and the same supplied locations.

7. **Translation non-trigger — pass.** Metadata-only classification:
   README translation is outside code-review scope; no review dispatch.
8. **Italian PR review trigger — pass.** Metadata-only classification:
   review PR 42 activates code review. Language changes composition only;
   fresh-review routing and publication authorization remain required.

## Limits

These simulations validate basic composition decisions only. No comparative
baseline, native activation measurement, independent review or native-speaker
validation was run. Existing deep-analysis and delegation behavior was not
changed or behaviorally revalidated.
