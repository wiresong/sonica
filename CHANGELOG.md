# Change Log

All notable changes to the "sonica" extension will be documented in this file.

## [Unreleased]

## [1.0.0]
- Make the subprocess work with Windows, Mac, and linux
- Remove the panning setting, as well as the diagnostics subsystem (since VSCode natively does diagnostics now)

## [0.2.0]
- Modified the extension to use a Rust subprocess, instead of a webview. No user-facing changes; things should be much more smooth and less resource-heavy, however.
- Extension is currently windows-only, due to the Rust subprocess; will be fixed later

## [0.1.2]
### Fixed
- Diagnostic sounds now respect file boundaries. Previously, if there was an error on line 2 in file A, a sound would also be played on line 2 in file B. That does not happen now.

## [0.1.1]
### Fixed
- Panning is now smooth.
- Rulers are now acquired within an editor context, which means rulers for different languages (based on the ["lang"] setting) work properly.

## [0.1.0]
- Initial release

