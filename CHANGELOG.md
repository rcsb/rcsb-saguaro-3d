# RCSB Saguaro 3D Changelog

[Semantic Versioning](https://semver.org/)

## [4.0.6] - 2023-11-30
### Dependency update
- rcsb-saguaro v3.0.6
- rcsb-saguaro-app v6.0.7

## [4.0.5] - 2023-12-04
### Improvement
- `FocusResidueColorTheme` used in assembly view

## [4.0.4] - 2023-11-30
### Dependency update
- rcsb-saguaro v3.0.5
- rcsb-saguaro-app v6.0.5

## [4.0.3] - 2023-11-27
### Dependency update
- rcsb-saguaro v3.0.4
- rcsb-saguaro-app v6.0.4

## [4.0.2] - 2023-11-27
### Dependency update
- rcsb-saguaro-app v6.0.3

## [4.0.1] - 2023-11-27
### Bug fix
- MSA polymer checkbox indicator bug fixed

## [4.0.0] - 2023-11-22
### Breaking changes
- Types are not anymore exposed from `build/src`
- All module classes and types are accessible from `lib/`
  - Modules format is `ESNext`
  - `lib/commonjs` exposes all modules in `CommonJS` format

### Improvement
- MSA group displays Polymer/Ligand before loading the structure
  - Checkboxes are displayed in grey color

### Code refactoring
- Sass @import changed to @use
- Styles sheets `scss` refactoring

### Dependency update
- Multiple dependencies have been updated
- rcsb-saguaro-app v6.0.0
- rcsb-saguaro v3.0.0

## [3.0.18] - 2023-10-03
### Dependency update
- rcsb-saguaro-app v5.1.5
- @rcsb/rcsb-molstar v2.8.0,
- molstar v3.40.1

## [3.0.17] - 2023-09-13
### Bug fix
- rcsb-saguaro-app not updated

## [3.0.16] - 2023-09-13
### Dependency update
- rcsb-saguaro-app v5.1.4

## [3.0.15] - 2023-09-08
### Dependency update
- rcsb-saguaro-app v5.1.1
- @rcsb/rcsb-molstar v3.7.4
- Updated multiple dependencies

## [3.0.14] - 2023-08-21
### Bug fix
- Models were not superposed correctly in Alignment views

## [3.0.13] - 2023-08-16
### Improvements
- Non `ball-and-stick` representations for ligands will always include an additional `ball-and-stick` representation
 
### Dependency update
- @rcsb/rcsb-molstar v3.7.3

## [3.0.12] - 2023-08-10
### Dependency update
- @rcsb/rcsb-molstar v3.7.2

## [3.0.11] - 2023-08-10
### Improvements
- New focus color theme to match the ribbon color in alignment views

### Dependency update
- molstar v3.38.3

## [3.0.10] - 2023-07-11
### Bug fix
- Change sequence chain in Assembly view bug fixed
 
### Dependency update
- rcsb-api-tools v4.1.13,
- rcsb-saguaro v2.5.13,
- rcsb-saguaro-app v5.0.8
- Updated multiple dependencies 

## [3.0.9] - 2023-05-19
### Bug fix
- Chain checkbox label bug fixed in assembly view

## [3.0.8] - 2023-05-19
### Bug fix
- Chain checkbox display bug fixed in assembly view 
- PFV onchange selection bug fixed in assembly view

## [3.0.7] - 2023-05-16
### Dependency update
- rcsb-saguaro-app v5.0.7

## [3.0.6] - 2023-05-16
### Configuration
- molstar and rcsb-molstar moved to peerDependencies

### Dependency update
- rcsb-molstar v2.6.1
- molstar v3.35.0
- rcsb-saguaro-app v5.0.6

## [3.0.5] - 2023-05-09
### Dependency update
- rcsb-saguaro-app v5.0.5

## [3.0.4] - 2023-05-03
### Dependency update
- rcsb-saguaro-app v5.0.4

## [3.0.3] - 2023-05-02
### Dependency update
- rcsb-saguaro-app v5.0.3

## [3.0.2] - 2023-05-02
### Dependency update
- rcsb-saguaro-app v5.0.2
 
## [3.0.1] - 2023-04-26
### Style config
- Structure panel z-index removed and defined as molstar style

## [3.0.0] - 2023-04-25
### Improvements
- New entry method `RcsbFv3DDataProviderInterface` that ingests and displays external alignments
- New interface `ComponentActionInterface` used to define what actions are triggered after a new structure is loaded
- Interface `LoadMolstarInterface<P,L>` requires two generics: `P` load argument type and `L` load return type
- Interface `ViewerModelMapManagerInterface<R,L>` needs a new generic that defines the type returned by the loading method in `LoadMolstarInterface`.
  - It defines a new method `getModelIdFromTrajectory(trajectory: L): string|undefined` 
that is used to map loaded structure ids with user provided ids in `LoadParams`
- Custom View has been decoupled from RCSB view
- No `StructureViewer` data is passed to `RcsbFvSequence` all communication between panels is dne through the `StateManager`
- New `RcsbViewBehaviourInterface` interface to extend "1d" behaviour to events
- `RcsbFv3DAbstract.render` converted to async method
- Exposed molstar trajectory preset configuration
- Removed global state for MSA checkboxes
### Dependency update
- rcsb-saguaro-app v5.0.0
- rcsb-saguaro v2.5.9
- rcsb-api-tools v4.1.3
### Configuration
- All packages are transpiled and included in the final module
### Breaking Changes
- rcsb-saguaro-app configuration `RcsbFvAdditionalConfig.trackConfigModifier.alignment` signature changed

## [2.3.10] - 2023-03-03
### Dependency update
- molstar update v3.31.2
- rcsb-molstar v2.5.11

## [2.3.9] - 2023-03-02
### Dependency update
- rcsb-saguaro-app v4.5.12

## [2.3.8] - 2023-01-20
### Dependency update
- rcsb-saguaro v2.5.8
- rcsb-saguaro-app v4.5.9

## [2.3.7] - 2022-12-12
### Bug fix
- `assemblyId` parameter has been removed from `AlignmentTrajectoryPresetProvider`
  - The provider check the first assembly that includes the entity

## [2.3.6] - 2022-12-05
### Display change
- `MsaRowTitleCheckboxState` are hide unless Mol* component exists

## [2.3.5] - 2022-12-05
### Improvement
- `MsaPfvManagerFactory` generalizes and replaces `SequenceIdentityPfvManager` and `UniprotPfvManager`
- `MsaRowTitleCheckboxState` is disabled if Mol* component is not generated
- `MsaRowTitleComponent` is blocked while structure is loaded

### Dependency update
- rcsb-saguaro-app v4.5.7

## [2.3.4] - 2022-11-28
### Dependency update
- rcsb-saguaro-app v4.5.6
- rcsb-saguaro v2.5.5

## [2.3.3] - 2022-11-23
### Dependency update
- rcsb-saguaro-app v4.5.4

## [2.3.2] - 2022-11-23
### Dependency update
- rcsb-saguaro-app v4.5.3

## [2.3.1] - 2022-11-23
### New Features
- Sorting component `MsaUiSortComponent` for sequence identity MSA

### Dependency update
- rcsb-saguaro-app v4.5.1
- rcsb-saguaro v2.5.4

## [2.3.0] - 2022-11-08
### Breaking Change 
- Param `LoadMethod.loadPdbIds` has been removed. Multiple entries can be loaded passing a list of `LoadMolstarInterface` to `RcsbFvStructureConfigInterface.loadConfig`

### Minor bug fixes
- CDN examples fixed

## [2.2.1] - 2022-11-03
### Improvement
- New attribute `RcsbViewInterface.additionalContent` to define the `additionalContent` React component

## [2.2.0] - 2022-11-03
### New Features
- New UniProt MSA 1D3D view
  - `UniprotPfvManagerFactory` builds UniProt Group MSA PFV
  - `SequenceIdentityPfvManagerFactory` builds Sequence Identity MSA PFV
  - `MsaCallbackManagerFactory` MSA 1D callbacks
  - `MsaBehaviourObserver` MSA 3D callbacks

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