# RCSB Saguaro 3D Changelog

[Semantic Versioning](https://semver.org/)

## [1.3.0] - 2022-02-08
### Improvements
- New class `AssemblyModelSate` to handle the assembly selection state in `RcsbFvSequence.SequenceViews.AssemblyView.AssemblyView` class
- New callback `operatorChangeCallback` function attached to operator dropdown menu changes

## [1.2.1] - 2021-12-20
### Dependency update
- Update to rcsb-api-tools 2.2.1

## [1.2.0] - 2021-12-07
### Improvements
- Support for assembly instance operators
- New selection interfaces `SaguaroChain`, `SaguaroPosition`, `SaguaroRange` and `SaguaroSet`
    - Support for selection involving multiple `modelId`
- rcsb-saguaro-app update 3.4.0
- rcsb-molstar update 2.0.0-dev.10

## [1.1.0] - 2021-11-02
### Minor configuration
- Exposed `InstanceSequenceConfig` for assembly view
- rcsb-saguaro-app update 3.2.1

## [1.0.1] - 2021-11-02
### Dependency update
- rcsb-saguaro-app update 3.1.1

## [1.0.0] - 2021-10-27
### General
- Initial release