
# README Updater

*A tool / script that generates  [` README.md `][README] .*

<br>

## Description

This script replaces markers in  [` docs/Template.md `][Template] <br>
with linked icons generated from the data found in <br>
[` docs/Helpers.yaml `][Helpers]  and  [` docs/Sponsors.yaml `][Sponsors] .

<br>
<br>

## Requirements

*Things you need if you run it manually.*

-   **[Deno]**

<br>
<br>

## Running

*Manual execution of the tool.*

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