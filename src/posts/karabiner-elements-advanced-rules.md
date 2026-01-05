---
title: How to Add Karabiner Elements Advanced Mapping Rules
date: 2021-11-03
excerpt: Create conditional key remapping rules that exclude specific applications using Karabiner Elements' Complex Modifications.
---

I've been using [Karabiner Elements](https://karabiner-elements.pqrs.org/) as my Mac's key remapping tool. My personal preference is to swap left-command and left-control, which works well for most applications. However, there are some applications where I don't want this swap to happen. This is where Karabiner Elements' advanced rules come in.

## The Problem

Simple key remapping works globally across all applications. But what if you need:

- Different mappings for specific applications
- Exclude certain apps from your remapping rules
- Complex conditional key behaviors

Karabiner Elements solves this with Complex Modifications - JSON configuration files that define advanced remapping rules with conditions.

## Creating Complex Modifications

You can use the online editor [Karabiner Complex Modification Generator](https://genesy.github.io/karabiner-complex-rules-generator/) to create complex configurations. Here's an example that swaps left-command and left-control, but excludes specific applications:

```json
{
  "title": "basic key-remapping",
  "rules": [
    {
      "description": "Exchange Left-Command Left-Control",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "left_gui"
          },
          "conditions": [
            {
              "type": "frontmost_application_unless",
              "bundle_identifiers": [
                "^com\\.adobe\\.AfterEffects$"
              ]
            }
          ],
          "to": [
            {
              "repeat": true,
              "modifiers": [],
              "key_code": "left_control"
            }
          ]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "left_control"
          },
          "conditions": [
            {
              "type": "frontmost_application_unless",
              "bundle_identifiers": [
                "^com\\.adobe\\.AfterEffects$"
              ]
            }
          ],
          "to": [
            {
              "repeat": true,
              "modifiers": [],
              "key_code": "left_gui"
            }
          ]
        }
      ]
    }
  ]
}
```

## Understanding the Configuration

Key elements of this configuration:

- `from.key_code`: The key to remap (`left_gui` is Command, `left_control` is Control)
- `conditions`: When to apply the rule
- `frontmost_application_unless`: Apply everywhere EXCEPT the listed apps
- `bundle_identifiers`: Regex patterns matching app bundle IDs
- `to.key_code`: The key to map to

## Finding an App's Bundle Identifier

To get any application's bundle identifier, use this script:

```bash
osascript -e 'id of app "After Effects"'
# Output: com.adobe.AfterEffects
```

Some common bundle identifiers:

| Application | Bundle Identifier |
|-------------|-------------------|
| After Effects | `com.adobe.AfterEffects` |
| Premiere Pro | `com.adobe.PremierePro` |
| Terminal | `com.apple.Terminal` |
| VS Code | `com.microsoft.VSCode` |

## Installing the Configuration

1. Save your JSON file with a `.json` extension
2. Place it in `~/.config/karabiner/assets/complex_modifications/`
3. Open Karabiner Elements Preferences
4. Go to "Complex Modifications" tab
5. Click "Add rule" and enable your new rule

Alternatively, you can import configurations directly from the online editor or paste your JSON into the Karabiner Elements preferences.

## Other Useful Condition Types

- `frontmost_application_if`: Only apply to specific apps
- `device_if`: Only apply to specific keyboards
- `keyboard_type_if`: Based on keyboard type (ANSI, ISO, JIS)
- `variable_if`: Based on custom variables (for modal behavior)
