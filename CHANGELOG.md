# RCSB Saguaro 3D Changelog

[Semantic Versioning](https://semver.org/)

## [2.1.1] - 2022-10-17
### Dependency update
- rcsb-saguaro-app v4.4.13
- rcsb-saguaro v2.2.16

### Minor display update
- 1D PFV on-change resets 3D display

## [2.1.0] - 2022-09-02
### Major refactoring
- `StructureViewerBehaviourObserverInterface` factory of structure viewer behaviours
- `StructureViewerBehaviourInterface` abstraction of structure viewer callback events

## [2.0.1] - 2022-09-01
### Dependency update
- rcsb-saguaro-app v4.4.1
- rcsb-saguaro v2.2.7

## [2.0.0] - 2022-08-31
### Dependency update
- rcsb-saguaro-app v4.4.0
- rcsb-saguaro v2.2.6
- rcsb-api-tools v4.1.0
- rcsb-molstar v2.5.5
- molstar v3.13.0
- React v18
- Updated multiple dependencies

### Major refactoring
- `StructureViewerInterface` abstraction to 3D structure viewer
  - `ViewerCallbackManagerInterface` defines 3D viewer callbacks
  - `ViewerActionManagerInterface` defines 3D viewer API
  - `ViewerModelMapManagerInterface` manager provides information of the loaded structures
- Global state interface `RcsbFvStateInterface` manages selections and loaded data 

### Breaking change
- `FeatureViewInterface` callback methods argument `selectorManager: RcsbFvSelectorManager` has been refactored to `stateManager: RcsbFvStateManager`

## [1.4.4] - 2022-05-26
### Dependency update
- rcsb-saguaro-app v4.3.6
- rcsb-api-tools v4.0.5

## [1.4.3] - 2022-05-20
### Dependency update
- rcsb-saguaro-app v4.3.5
- rcsb-api-tools v4.0.4 

## [1.4.2] - 2022-05-20
### Dependency update
- rcsb-api-tools v4.0.3

## [1.4.1] - 2022-05-05
### Dependency update
- rcsb-saguaro-app v4.3.2

## [1.4.0] - 2022-04-20
### Improvement
- Extending 1D-3D display to any rcsb-saguaro-app PFV methods
  - `PfvFactoryInterface` defines how the PFV is created 
  - `CallbackManagerInterface` defines the callbacks between the 1D and 3D panels
  - Current implementations: assembly and uniprot (partial implementation)

## [1.3.10] - 2022-04-14
### Dependency update
- rcsb-api-tools v4.0.1
- rcsb-saguaro-app v4.1.2
 
## [1.3.9] - 2022-04-14
### Dependency update
- rcsb-saguaro v2.0.6
- rcsb-saguaro-app v4.1.1

## [1.3.8] - 2022-04-13
### Dependency update
- rcsb-api-tools v4.0.0
- rcsb-saguaro v2.0.5
- rcsb-saguaro-app v4.1.0
- removed http-server module (3 high severity vulnerabilities)

## [1.3.7] - 2022-04-07
### Bug fixes
- `assymId` empty string bug fixed

## [1.3.6] - 2022-04-07
### Dependency update
- rcsb-saguaro update 2.0.4
- rcsb-saguaro-app update 4.0.7
- rcsb-api-tools update 3.0.2

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