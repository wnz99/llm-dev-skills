# Diagram patterns

Use these as layout examples, replacing their entities and edges with the
actual relationships. Widths include leading spaces. Captions are outside
the diagram and do not count toward its width budget.

## Compact flow and narrow terminals

```text
[ Source ] --> [ Parse ] --> [ Store ]
```

If the row exceeds the available width, turn it downward. Preserve full labels
or introduce mapped aliases; never truncate.

```text
[ Source ]
     |
     v
[ Parse ]
     |
     v
[ Store ]
```

## Decision and merge

Both outcomes are explicit. The junction below the branches means both paths
continue to the same next step; it does not mean both execute.

```text
             [ Valid? ]
                  |
         +--------+--------+
         |                 |
        yes                no
         |                 |
         v                 v
    [ Accept ]        [ Reject ]
         |                 |
         +--------+--------+
                  |
                  v
               [ End ]
```

For more than a few outcomes, stack labeled branches vertically instead.

## Sequence

Time proceeds downward. Each arrow is a message, with its label on the row
above. Requests and replies use explicit directions; a dashed line alone does
not establish which is a reply.

```text
Client           API             DB
  |               |               |
  | request       |               |
  |-------------->|               |
  |               | query         |
  |               |-------------->|
  |               | result        |
  |               |<--------------|
  | response      |               |
  |<--------------|               |
```

## Retry loop

Show the retry condition. If a retry budget, stop condition, or failure path
is unknown, identify that gap outside the diagram rather than inventing it.

```text
       +-------------------+
       |                   |
       v                   |
   [ Attempt ]--retryable--+
       |
     success
       |
       v
    [ Done ]
```

## Boxes and connected boundaries

Different node widths are fine. Here arrows mean data flow, and the vertical
connector meets the API boundary at a junction.

```text
+--------+     +-----------+
| Client |---->| API       |
+--------+     +----+------+
                    |
                    v
               +----+----+
               | Storage |
               +---------+
```

## Directory tree

Use ASCII branches instead of Unicode tree glyphs. Keep directory markers and
indentation consistent. A hierarchy edge means ownership, not execution order.

```text
project/
|-- src/
|   |-- app.py
|   `-- helpers.py
`-- tests/
    `-- test_app.py
```

## Names outside the ASCII character set

Keep the diagram portable without losing identity:

```text
[ A ] --> [ B ]
```

Example legend: A = `入口`; B = `保存`. Preserve the original spelling in
the legend, with terminal control characters visibly escaped if present.
