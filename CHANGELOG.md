# RCSB Saguaro 3D Changelog

[Semantic Versioning](https://semver.org/)

## [1.3.5] - 2022-03-28
### Improvements
- `RcsbFv3DAbstract.updateConfig` method accepts partial states (`Partial<RcsbFvStructureInterface>` and `Partial<RcsbFvSequenceInterface>`)
- `RcsbFv3DAbstract.unmount` method includes an optional callback executed after when the component is unmounted
  - Assembly view `Back` link action has been refactored using the unmount-callback
- Minor code refactoring

## [1.3.4] - 2022-03-07
### Bug fixes
- NMR model change bug fix. New strategy to find the right `modeId` filtering the `assemblyModelSate`

## [1.3.3] - 2022-03-07
### Error publishing
- No changes, only examples were build

## [1.3.2] - 2022-03-04
### Configuration improvement
- `RcsbFv3DAssemblyInterface` configuration exposes a new optional parameter`assemblyId` to select the assembly that is being displayed

## [1.3.1] - 2022-02-16
### Dependency update
- Updated multiple dependencies

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