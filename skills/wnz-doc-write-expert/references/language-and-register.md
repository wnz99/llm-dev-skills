# Language and register

Read this file before writing, editing or assessing any document prose. It
applies to new documents, updates during code work, fixes after a review and
fluency assessment in a review.

Write idiomatically in the target language, whether authoring, adapting source
material, or updating an existing document. Compose for its readers rather than
drafting an English version and translating it sentence by sentence. English
sources supply facts, not a sentence structure to imitate.

- Establish the document language and any relevant locale from explicit user
  instructions, then the target document and corpus conventions. Do not infer
  the document language solely from the language used in chat. Ask only when
  ambiguity would materially change the result.
- Match register to purpose and audience using the target language's conventions:
  precise technical prose for specifications and runbooks, a clear teaching
  voice with progressive explanations for tutorials, and the appropriate
  professional or persuasive tone for policies and proposals.
- Use natural syntax, idioms, headings, transitions, and forms of address. Avoid
  English calques and unnecessary English terms where established local domain
  terminology exists; retain commonly accepted technical loanwords when natural.
- Follow available target-language style guides, glossaries, and representative
  documents from the same domain for terminology, structure and conventions.
  Keep terminology and forms of address consistent. Use plain, unambiguous
  phrasing for technical instructions rather than adding idioms to make them
  sound native. Apply local typography, number, and date conventions without
  changing values, units, or factual context.
- Preserve source meaning, requirements, warnings, qualifications, quantities,
  and evidence. Fluent adaptation does not authorize new claims or weaker rules.
  Keep executable commands, code, API identifiers, paths, and exact UI labels
  unchanged unless a verified localized equivalent applies; explain them in the
  target language.
- Follow an explicit request for a literal or aligned translation when given.
  Otherwise preserve meaning and reader outcomes without forcing English wording
  or paragraph structure onto the target language.
- If fluency or a consequential terminology choice remains uncertain after the
  passes below, flag the specific issue for a fluent domain reviewer instead of
  claiming native-speaker validation.

## Keep document register independent of session style

Chat response modes, whether terse, compressed or token-saving, do not set
document style. The user's task wording, note-style sources and instruction
files of another document type supply facts and rules, not a sentence style.
Write document prose in complete, connected sentences for its reader, even when
the session, the task wording and the sources are terse. A brevity or
token-saving request that does not name the document applies to chat output
only.

The document's own conventions take precedence: an explicit document-style
request from the user or the repository, and a consistent, deliberate style in
the target document or in sibling documents of the same type, such as a
compact cheat sheet. A terse `AGENTS.md` sets the style only when it is itself
the target. Tables, headings and reference lists follow corpus conventions.
When existing prose is terse because it is poorly written rather than by
convention, take its facts and terms but not its sentence style for new prose.

Register drift is most likely when documentation changes alongside code,
configuration or refactoring work. Treat that update as its own writing step
after the code change: apply the sentence checks, the three passes and the
corpus rules to the changed prose, and write it with the host's native
file-edit tool. Prose composed inside a generated code string, template literal
or script inherits the implementation register and escapes these checks. Use
the full [author workflow](author-workflow.md) only for a new document or a
substantial new section.

## Check every sentence and paragraph

These checks apply in any language and catch the failures most often seen in
generated documentation. Run them on new or changed prose sentences, within the
document conventions above. Outside a readability request, do not rewrite
surrounding text to apply these checks.

1. Each sentence has a finite verb and, where the language needs one, an
   explicit subject; procedure steps may use the infinitive or imperative form
   the corpus uses. A colon, slash, arrow or dash does not replace a verb or
   connective.
2. Articles, prepositions and agreement follow the target grammar; dropping
   them to save space reads as notes, not documentation.
3. Each pronoun and implicit subject has one obvious referent in the same or
   previous sentence.
4. Unless the corpus has another convention, abbreviated project identifiers
   such as environment, stack or branch names appear as formatted identifiers
   with a governing noun ("el entorno `qa`"), not as bare words or slash pairs
   ("en qa", "prod/qa"). Common acronyms such as URL stay plain.
5. Related facts are joined by the connective that states their real relation
   (cause, condition, contrast, consequence or sequence) when the evidence
   supports it; see the inference audit below.
6. One main idea per sentence. Split sentences above about 35 words or with more
   than two subordinate clauses.
7. The document speaks about the system, not about its sources or its writing:
   no "as the ticket says" or "this section was rewritten".

For each paragraph, check that it opens with what the reader needs to know or
do, that its sentences develop that one topic, and that unrelated facts become
a bulleted list rather than a string of unconnected sentences. State each
instruction once, where the reader needs it.

Before writing or assessing Italian, Spanish, French or German prose, read that
language's section of [language-quality.md](language-quality.md).

## Run fluency, fidelity and inference passes separately

A single combined read tends to trade one quality for the other, so run three
separate passes:

1. **Fluency:** read only the new text, as a native professional reader who has
   not seen the source. Rewrite whole sentences that sound translated, clipped
   or ambiguous; patching single words keeps the broken syntax.
2. **Fidelity:** compare the result with the source or evidence statement by
   statement against the preservation rules above, including scope, referents,
   links and anchors. Compare code spans, links and numbers mechanically when
   tools allow.
3. **Inference audit:** list each statement not directly supported by the
   evidence (sources, code or verified facts), especially causal connectives,
   absolutes ("only", "always", "all"), implied uniqueness, guarantees
   ("with zero downtime") and new mandatory steps. Delete it or label it as
   a recommendation; fluent prose that adds plausible facts is a fidelity
   defect.

For a readability request, restate each paragraph from its meaning and then
run the three passes.
