---
title: How to Add Karabiner Elements Advanced Mapping Rules
date: 2021-11-03
excerpt: Create conditional key remapping rules that exclude specific applications using Karabiner Elements' Complex Modifications.
---

<div class="lang-en">

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

</div>

<div class="lang-zh">

我一直在使用 [Karabiner Elements](https://karabiner-elements.pqrs.org/) 作为 Mac 的按键映射工具。我个人偏好是交换左 Command 和左 Control，这在大多数应用中效果很好。然而，有些应用我不希望进行这种交换。这就是 Karabiner Elements 高级规则发挥作用的地方。

## 问题

简单的按键映射在所有应用中全局生效。但如果你需要：

- 针对特定应用使用不同的映射
- 将某些应用排除在映射规则之外
- 复杂的条件按键行为

Karabiner Elements 通过复杂修改（Complex Modifications）解决了这个问题——这是定义带条件的高级映射规则的 JSON 配置文件。

## 创建复杂修改

你可以使用在线编辑器 [Karabiner Complex Modification Generator](https://genesy.github.io/karabiner-complex-rules-generator/) 来创建复杂配置。这是一个交换左 Command 和左 Control 但排除特定应用的示例：

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

## 理解配置

此配置的关键元素：

- `from.key_code`：要重映射的按键（`left_gui` 是 Command，`left_control` 是 Control）
- `conditions`：何时应用规则
- `frontmost_application_unless`：除列出的应用外全部应用
- `bundle_identifiers`：匹配应用 Bundle ID 的正则表达式
- `to.key_code`：映射到的按键

## 查找应用的 Bundle Identifier

要获取任何应用的 bundle identifier，使用此脚本：

```bash
osascript -e 'id of app "After Effects"'
# 输出: com.adobe.AfterEffects
```

一些常见的 bundle identifier：

| 应用 | Bundle Identifier |
|-----|-------------------|
| After Effects | `com.adobe.AfterEffects` |
| Premiere Pro | `com.adobe.PremierePro` |
| Terminal | `com.apple.Terminal` |
| VS Code | `com.microsoft.VSCode` |

## 安装配置

1. 将你的 JSON 文件保存为 `.json` 扩展名
2. 放置到 `~/.config/karabiner/assets/complex_modifications/`
3. 打开 Karabiner Elements 偏好设置
4. 进入 "Complex Modifications" 标签页
5. 点击 "Add rule" 并启用你的新规则

或者，你可以直接从在线编辑器导入配置，或将 JSON 粘贴到 Karabiner Elements 偏好设置中。

## 其他有用的条件类型

- `frontmost_application_if`：仅对特定应用生效
- `device_if`：仅对特定键盘生效
- `keyboard_type_if`：基于键盘类型（ANSI、ISO、JIS）
- `variable_if`：基于自定义变量（用于模态行为）

</div>
