# Change Log

All notable changes to the "linechecker" extension will be documented in this file.

## [Unreleased]

# # [0.1.2]
### Fixed
- Diagnostic sounds now respect file boundaries. Previously, if there was an error on line 2 in file A, a sound would also be played on line 2 in file B. That does not happen now.

## [0.1.1]
### Fixed
- Panning is now smooth.
- Rulers are now acquired within an editor context, which means rulers for different languages (based on the ["lang"] setting) work properly.

## [0.1.0]
- Initial release

