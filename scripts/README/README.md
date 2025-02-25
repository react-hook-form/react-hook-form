# README Updater

_A tool / script that generates  [` README.md `][README] ._

<br>

## Description

This script replaces markers in  [` docs/Template.md `][Template] <br>
with linked icons generated from the data found in <br>
[` docs/Helpers.yaml `][Helpers]  and  [` docs/Sponsors.yaml `][Sponsors] .

<br>
<br>

## Markers

A marker is placed at the start of a line.

<br>

### Syntax

```markdown
~Marker_Id
```

<br>

### Types

- `Sponsors`

  _Generates icons for sponsors._

- `Helpers`

  _Generates icons for helpers._

<br>
<br>

## Requirements

_Things you need if you run it manually._

- **[Deno]**

<br>
<br>

## Running

_Manual execution of the tool._

<br>

```shell
deno run                                    \
    --allow-read                            \
    --allow-write                           \
    --importmap=scripts/README/Imports.json \
    scripts/README/Updater.js
```

<br>

<!----------------------------------------------------------------------------->

[Sponsors]: ../../docs/Sponsors.yaml
[Template]: ../../docs/Template.md
[Helpers]: ../../docs/Helpers.yaml
[README]: ../../README.md
[Deno]: https://deno.land/
