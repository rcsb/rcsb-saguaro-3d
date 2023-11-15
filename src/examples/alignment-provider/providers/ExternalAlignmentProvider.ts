import {
    AlignmentResponse,
    GroupReference,
    SequenceReference,
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    AlignmentCollectConfig,
    AlignmentCollectorInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";

import {
    RcsbModuleDataProviderInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {AlignmentReference} from "./AlignmentReference";
import {
    LoadParamsProviderInterface,
    RigidTransformType,
    TransformMatrixType
} from "../../../RcsbFvStructure/StructureUtils/StructureLoaderInterface";

import {
    Alignment,
    AlignmentRegion,
    StructureAlignmentResponse,
    StructureEntry,
    StructureURL
} from "./alignment-response";
import {
    LoadMethod,
    LoadMolstarInterface,
    LoadMolstarReturnType
} from "../../../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {
    AlignmentTrajectoryParamsType,
    AlignmentTrajectoryPresetProvider
} from "../../../RcsbFvStructure/StructureViewers/MolstarViewer/TrajectoryPresetProvider/AlignmentTrajectoryPresetProvider";
import {
    FlexibleAlignmentTrajectoryPresetProvider
} from "../../../RcsbFvStructure/StructureViewers/MolstarViewer/TrajectoryPresetProvider/FlexibleAlignmentTrajectoryPresetProvider";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";

const alignment = {
    "info": {
        "uuid": "e6e216de-c650-4ad5-bd81-45e75dfbe180",
        "status": "COMPLETE"
    },
    "meta": {
        "alignment_mode": "pairwise",
        "alignment_method": "fatcat-rigid"
    },
    "results": [
        {
            "structures": [
                {
                    "entry_id": "101M",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "1ASH",
                    "selection": {
                        "asym_id": "A"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 4,
                                "beg_index": 0,
                                "length": 47
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 52,
                                "beg_index": 52,
                                "length": 70
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 124,
                                "beg_index": 128,
                                "length": 22
                            }
                        ],
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 1,
                                "beg_index": 0,
                                "length": 17
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 22,
                                "beg_index": 21,
                                "length": 61
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 86,
                                "beg_index": 86,
                                "length": 14
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 101,
                                "beg_index": 101,
                                "length": 47
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            -0.7671995717115603,
                            -0.5623954843039239,
                            0.30840904072376607,
                            0,
                            -0.6011420900233072,
                            0.4627787494512096,
                            -0.6515090303739346,
                            0,
                            0.2236805864799372,
                            -0.6852351043918645,
                            -0.6931232552303105,
                            0,
                            37.48154540719762,
                            28.2044983569036,
                            -7.345065372687518,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 1.95,
                                "type": "RMSD"
                            },
                            {
                                "value": 330.13,
                                "type": "similarity-score"
                            }
                        ],
                        "n_aln_residue_pairs": 139
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 4,
                            "beg_index": 0,
                            "length": 17
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 21,
                            "beg_index": 21,
                            "length": 62
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 83,
                            "beg_index": 86,
                            "length": 14
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 97,
                            "beg_index": 101,
                            "length": 49
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 17,
                            "length": 4
                        },
                        {
                            "beg_index": 83,
                            "length": 3
                        },
                        {
                            "beg_index": 100,
                            "length": 1
                        }
                    ]
                },
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 1,
                            "beg_index": 0,
                            "length": 51
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 52,
                            "beg_index": 52,
                            "length": 74
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 126,
                            "beg_index": 128,
                            "length": 22
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 51,
                            "length": 1
                        },
                        {
                            "beg_index": 126,
                            "length": 2
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 0.15,
                        "type": "sequence-identity"
                    },
                    {
                        "value": 1.94,
                        "type": "RMSD"
                    },
                    {
                        "value": 0.79,
                        "type": "TM-score"
                    },
                    {
                        "value": 330.13,
                        "type": "similarity-score"
                    },
                    {
                        "value": 0.34,
                        "type": "sequence-similarity"
                    }
                ],
                "n_aln_residue_pairs": 139,
                "n_modeled_residues": [
                    154,
                    147
                ],
                "seq_aln_len": 150,
                "aln_coverage": [
                    90,
                    95
                ]
            }
        },
        {
            "structures": [
                {
                    "entry_id": "101M",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "4HHB",
                    "selection": {
                        "asym_id": "A"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 2,
                                "beg_index": 0,
                                "length": 48
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 56,
                                "beg_index": 54,
                                "length": 93
                            }
                        ],
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 1,
                                "beg_index": 0,
                                "length": 141
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            0.5659010881349978,
                            0.8158255303919226,
                            0.11909938038614465,
                            0,
                            0.49060456462775587,
                            -0.21711201635870375,
                            -0.8439013766543271,
                            0,
                            -0.6626183815847819,
                            0.5359954069890864,
                            -0.5231116554547112,
                            0,
                            16.44633740010974,
                            7.329736404913569,
                            7.069768946221407,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 1.41,
                                "type": "RMSD"
                            },
                            {
                                "value": 360.42,
                                "type": "similarity-score"
                            }
                        ],
                        "n_aln_residue_pairs": 141
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 2,
                            "beg_index": 0,
                            "length": 147
                        }
                    ]
                },
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 1,
                            "beg_index": 0,
                            "length": 48
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 49,
                            "beg_index": 54,
                            "length": 93
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 48,
                            "length": 6
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 1.63,
                        "type": "RMSD"
                    },
                    {
                        "value": 360.42,
                        "type": "similarity-score"
                    },
                    {
                        "value": 0.26,
                        "type": "sequence-identity"
                    },
                    {
                        "value": 0.83,
                        "type": "TM-score"
                    },
                    {
                        "value": 0.4,
                        "type": "sequence-similarity"
                    }
                ],
                "n_aln_residue_pairs": 141,
                "n_modeled_residues": [
                    154,
                    141
                ],
                "seq_aln_len": 147,
                "aln_coverage": [
                    92,
                    100
                ]
            }
        },
        {
            "structures": [
                {
                    "entry_id": "101M",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "3IA3",
                    "selection": {
                        "asym_id": "A"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 6,
                                "beg_index": 0,
                                "length": 2
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 9,
                                "beg_index": 3,
                                "length": 10
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 70,
                                "beg_index": 64,
                                "length": 7
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 90,
                                "beg_index": 84,
                                "length": 64
                            }
                        ],
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 2,
                                "beg_index": 0,
                                "length": 2
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 5,
                                "beg_index": 3,
                                "length": 28
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 37,
                                "beg_index": 99,
                                "length": 23
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 62,
                                "beg_index": 124,
                                "length": 30
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            0.5053504853280419,
                            -0.8551690322642134,
                            -0.11535516128462073,
                            0,
                            0.8381805444620154,
                            0.45468307113605794,
                            0.3011920976845868,
                            0,
                            -0.20512011569826996,
                            -0.248896024633924,
                            0.946560355739325,
                            0,
                            54.00745824109328,
                            20.631415015987336,
                            1.2186542597577539,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 10.35,
                                "type": "RMSD"
                            },
                            {
                                "value": 163.43,
                                "type": "similarity-score"
                            }
                        ],
                        "n_aln_residue_pairs": 83
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 6,
                            "beg_index": 0,
                            "length": 95
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 101,
                            "beg_index": 99,
                            "length": 23
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 124,
                            "beg_index": 124,
                            "length": 30
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 95,
                            "length": 4
                        },
                        {
                            "beg_index": 122,
                            "length": 2
                        }
                    ]
                },
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 2,
                            "beg_index": 0,
                            "length": 13
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 15,
                            "beg_index": 64,
                            "length": 7
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 22,
                            "beg_index": 84,
                            "length": 70
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 13,
                            "length": 51
                        },
                        {
                            "beg_index": 71,
                            "length": 13
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 0.38,
                        "type": "TM-score"
                    },
                    {
                        "value": 4.06,
                        "type": "RMSD"
                    },
                    {
                        "value": 163.43,
                        "type": "similarity-score"
                    },
                    {
                        "value": 0.13,
                        "type": "sequence-identity"
                    },
                    {
                        "value": 0.29,
                        "type": "sequence-similarity"
                    }
                ],
                "n_aln_residue_pairs": 83,
                "n_modeled_residues": [
                    154,
                    90
                ],
                "seq_aln_len": 154,
                "aln_coverage": [
                    54,
                    92
                ]
            }
        },
        {
            "structures": [
                {
                    "entry_id": "101M",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "3IA3",
                    "selection": {
                        "asym_id": "B"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 1,
                                "beg_index": 0,
                                "length": 18
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 22,
                                "beg_index": 22,
                                "length": 30
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 58,
                                "beg_index": 58,
                                "length": 85
                            }
                        ],
                        [
                            {
                                "asym_id": "B",
                                "beg_seq_id": 6,
                                "beg_index": 0,
                                "length": 4
                            },
                            {
                                "asym_id": "B",
                                "beg_seq_id": 11,
                                "beg_index": 5,
                                "length": 129
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            -0.42302765123934255,
                            -0.016759653799444912,
                            0.9059617653584768,
                            0,
                            0.36791779101822186,
                            0.910522894182729,
                            0.18863869757125365,
                            0,
                            -0.8280604478775673,
                            0.41311883662407556,
                            -0.3790101865216464,
                            0,
                            80.69972926533072,
                            -0.278244322992661,
                            6.001546353485595,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 278.41,
                                "type": "similarity-score"
                            },
                            {
                                "value": 2.79,
                                "type": "RMSD"
                            }
                        ],
                        "n_aln_residue_pairs": 133
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 1,
                            "beg_index": 0,
                            "length": 4
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 5,
                            "beg_index": 5,
                            "length": 138
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 4,
                            "length": 1
                        }
                    ]
                },
                {
                    "regions": [
                        {
                            "asym_id": "B",
                            "beg_seq_id": 6,
                            "beg_index": 0,
                            "length": 19
                        },
                        {
                            "asym_id": "B",
                            "beg_seq_id": 25,
                            "beg_index": 22,
                            "length": 30
                        },
                        {
                            "asym_id": "B",
                            "beg_seq_id": 55,
                            "beg_index": 58,
                            "length": 85
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 19,
                            "length": 3
                        },
                        {
                            "beg_index": 52,
                            "length": 6
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 278.41,
                        "type": "similarity-score"
                    },
                    {
                        "value": 0.35,
                        "type": "sequence-similarity"
                    },
                    {
                        "value": 3.03,
                        "type": "RMSD"
                    },
                    {
                        "value": 0.66,
                        "type": "TM-score"
                    },
                    {
                        "value": 0.2,
                        "type": "sequence-identity"
                    }
                ],
                "n_aln_residue_pairs": 133,
                "n_modeled_residues": [
                    154,
                    135
                ],
                "seq_aln_len": 143,
                "aln_coverage": [
                    86,
                    99
                ]
            }
        }
    ]
};
const flexAlignment = {
    "info": {
        "uuid": "c74f1b38-ad36-4c24-88ea-c947eba2b965",
        "status": "COMPLETE"
    },
    "meta": {
        "alignment_mode": "pairwise",
        "alignment_method": "fatcat-flexible"
    },
    "results": [
        {
            "structures": [
                {
                    "entry_id": "1SR6",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "1KWO",
                    "selection": {
                        "asym_id": "A"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 6,
                                "beg_index": 0,
                                "length": 18
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 26,
                                "beg_index": 20,
                                "length": 11
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 38,
                                "beg_index": 32,
                                "length": 163
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 213,
                                "beg_index": 198,
                                "length": 194
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 410,
                                "beg_index": 395,
                                "length": 153
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 566,
                                "beg_index": 551,
                                "length": 3
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 572,
                                "beg_index": 557,
                                "length": 54
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 643,
                                "beg_index": 612,
                                "length": 51
                            }
                        ],
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 6,
                                "beg_index": 0,
                                "length": 18
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 27,
                                "beg_index": 20,
                                "length": 174
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 213,
                                "beg_index": 198,
                                "length": 194
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 410,
                                "beg_index": 395,
                                "length": 153
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 569,
                                "beg_index": 551,
                                "length": 56
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 642,
                                "beg_index": 610,
                                "length": 52
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            0.5748680038797991,
                            -0.6350218438618033,
                            -0.5160174763839023,
                            0,
                            0.4813145452568598,
                            0.7724272890898242,
                            -0.4143578062418128,
                            0,
                            0.6617122385443976,
                            -0.010165672024066708,
                            0.7496889838278681,
                            0,
                            -3.505312472354479,
                            -5.385563704760273,
                            52.46070687230462,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 1772.68,
                                "type": "similarity-score"
                            },
                            {
                                "value": 2.63,
                                "type": "RMSD"
                            }
                        ],
                        "n_aln_residue_pairs": 647
                    }
                },
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 699,
                                "beg_index": 668,
                                "length": 3
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 707,
                                "beg_index": 676,
                                "length": 20
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 734,
                                "beg_index": 700,
                                "length": 102
                            }
                        ],
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 704,
                                "beg_index": 668,
                                "length": 23
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 734,
                                "beg_index": 700,
                                "length": 102
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            0.03983531379027039,
                            -0.9969211935123139,
                            -0.06753726157621881,
                            0,
                            0.5428660722665761,
                            0.07833822385293923,
                            -0.8361576108996602,
                            0,
                            0.8388739925382667,
                            -0.0033550871152113193,
                            0.5443153204102911,
                            0,
                            10.707819252191578,
                            1.4313621373339025,
                            38.51048821786332,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 2.01,
                                "type": "RMSD"
                            },
                            {
                                "value": 328.8,
                                "type": "similarity-score"
                            }
                        ],
                        "n_aln_residue_pairs": 125
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 6,
                            "beg_index": 0,
                            "length": 195
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 213,
                            "beg_index": 198,
                            "length": 414
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 643,
                            "beg_index": 612,
                            "length": 88
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 734,
                            "beg_index": 700,
                            "length": 102
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 195,
                            "length": 3
                        }
                    ]
                },
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 6,
                            "beg_index": 0,
                            "length": 18
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 27,
                            "beg_index": 20,
                            "length": 11
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 38,
                            "beg_index": 32,
                            "length": 163
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 210,
                            "beg_index": 195,
                            "length": 197
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 410,
                            "beg_index": 395,
                            "length": 153
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 569,
                            "beg_index": 551,
                            "length": 3
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 572,
                            "beg_index": 557,
                            "length": 53
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 642,
                            "beg_index": 610,
                            "length": 1
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 643,
                            "beg_index": 612,
                            "length": 55
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 704,
                            "beg_index": 668,
                            "length": 3
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 707,
                            "beg_index": 676,
                            "length": 20
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 734,
                            "beg_index": 700,
                            "length": 102
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 18,
                            "length": 2
                        },
                        {
                            "beg_index": 31,
                            "length": 1
                        },
                        {
                            "beg_index": 392,
                            "length": 3
                        },
                        {
                            "beg_index": 548,
                            "length": 3
                        },
                        {
                            "beg_index": 554,
                            "length": 3
                        },
                        {
                            "beg_index": 611,
                            "length": 1
                        },
                        {
                            "beg_index": 667,
                            "length": 1
                        },
                        {
                            "beg_index": 671,
                            "length": 5
                        },
                        {
                            "beg_index": 696,
                            "length": 4
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 2.48,
                        "type": "RMSD"
                    },
                    {
                        "value": 0.6,
                        "type": "TM-score"
                    },
                    {
                        "value": 2076.04,
                        "type": "similarity-score"
                    },
                    {
                        "value": 0.98,
                        "type": "sequence-identity"
                    },
                    {
                        "value": 0.98,
                        "type": "sequence-similarity"
                    }
                ],
                "n_aln_residue_pairs": 772,
                "n_modeled_residues": [
                    801,
                    780
                ],
                "seq_aln_len": 802,
                "aln_coverage": [
                    96,
                    99
                ]
            }
        }
    ]
};
const alignmentExample = {
    "info": {
        "uuid": "538d54e2-039c-44c8-bd5f-bb26af9c45bb",
        "status": "COMPLETE"
    },
    "meta": {
        "alignment_mode": "pairwise",
        "alignment_method": "fatcat-rigid"
    },
    "results": [
        {
            "structures": [
                {
                    "url": "https://alphafold.ebi.ac.uk/files/AF-P41235-F1-model_v2.cif",
                    "format": "mmcif",
                    "is_binary": false,
                    "name": "AF-P41235-F1",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "3CBB",
                    "selection": {
                        "asym_id": "C"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 58,
                                "beg_index": 0,
                                "length": 76
                            }
                        ],
                        [
                            {
                                "asym_id": "C",
                                "beg_seq_id": 1,
                                "beg_index": 0,
                                "length": 76
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            0.663932900191227,
                            -0.6410962059424273,
                            0.3849529305900804,
                            0,
                            -0.6205267418674186,
                            -0.18505769796524382,
                            0.7620368829992492,
                            0,
                            -0.4173004513190375,
                            -0.7448149455737514,
                            -0.5206832340097945,
                            0,
                            2.241812113864647,
                            17.198483576583477,
                            -52.357664887014344,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 214.71,
                                "type": "similarity-score"
                            },
                            {
                                "value": 0.47,
                                "type": "RMSD"
                            }
                        ],
                        "n_aln_residue_pairs": 76
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "sequence": "MRLSKTLVDMDMADYSAALDPAYTTLEFENVQVLTMGNDTSPSEGTNLNAPNSLGVSALCAICGDRATGKHYGASSCDGCKGFFRRSVRKNHMYSCRFSRQCVVDKDKRNQCRYCRLKKCFRAGMKKEAVQNERDRISTRRSSYEDSSLPSINALLQAEVLSRQITSPVSGINGDIRAKKIASIADVCESMKEQLLVLVEWAKYIPAFCELPLDDQVALLRAHAGEHLLLGATKRSMVFKDVLLLGNDYIVPRHCPELAEMSRVSIRILDELVLPFQELQIDDNEYAYLKAIIFFDPDAKGLSDPGKIKRLRSQVQVSLEDYINDRQYDSRGRFGELLLLLPTLQSITWQMIEQIQFIKLFGMAKIDNLLQEMLLGGSPSDAPHAHHPLHPHLMQEHMGTNVIVANTMPTHLSNGQMCEWPRPRGQAATPETPQPSPPGGSGSEPYKLLPGAVATIVKPLSAIPQPTITKQEVI",
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 58,
                            "beg_index": 0,
                            "length": 76
                        }
                    ]
                },
                {
                    "sequence": "ALCAICGDRATGKHYGASSCDGCKGFFRRSVRKNHMYSCRFSRQCVVDKDKRNQCRYCRLKKCFRAGMKKEAVQNERD",
                    "regions": [
                        {
                            "asym_id": "C",
                            "beg_seq_id": 1,
                            "beg_index": 0,
                            "length": 76
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 1,
                        "type": "sequence-identity"
                    },
                    {
                        "value": 214.71,
                        "type": "similarity-score"
                    },
                    {
                        "value": 1,
                        "type": "sequence-similarity"
                    },
                    {
                        "value": 0.49,
                        "type": "RMSD"
                    },
                    {
                        "value": 0.16,
                        "type": "TM-score"
                    }
                ],
                "n_aln_residue_pairs": 76,
                "n_modeled_residues": [
                    474,
                    76
                ],
                "seq_aln_len": 76,
                "aln_coverage": [
                    16,
                    100
                ]
            }
        },
        {
            "structures": [
                {
                    "url": "https://alphafold.ebi.ac.uk/files/AF-P41235-F1-model_v2.cif",
                    "format": "mmcif",
                    "is_binary": false,
                    "name": "AF-P41235-F1",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "1PZL",
                    "selection": {
                        "asym_id": "A"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 146,
                                "beg_index": 0,
                                "length": 21
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 173,
                                "beg_index": 27,
                                "length": 206
                            }
                        ],
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 5,
                                "beg_index": 0,
                                "length": 21
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 32,
                                "beg_index": 27,
                                "length": 206
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            -0.010053370832324049,
                            -0.2331468555903751,
                            -0.9723895687754106,
                            0,
                            -0.5818706004499447,
                            -0.7894818469306177,
                            0.19530749524542618,
                            0,
                            -0.813219241082581,
                            0.5677684009306454,
                            -0.12772434708280683,
                            0,
                            26.741147368855113,
                            9.829205405298664,
                            85.1383381307709,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 0.85,
                                "type": "RMSD"
                            },
                            {
                                "value": 638.55,
                                "type": "similarity-score"
                            }
                        ],
                        "n_aln_residue_pairs": 227
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "sequence": "MRLSKTLVDMDMADYSAALDPAYTTLEFENVQVLTMGNDTSPSEGTNLNAPNSLGVSALCAICGDRATGKHYGASSCDGCKGFFRRSVRKNHMYSCRFSRQCVVDKDKRNQCRYCRLKKCFRAGMKKEAVQNERDRISTRRSSYEDSSLPSINALLQAEVLSRQITSPVSGINGDIRAKKIASIADVCESMKEQLLVLVEWAKYIPAFCELPLDDQVALLRAHAGEHLLLGATKRSMVFKDVLLLGNDYIVPRHCPELAEMSRVSIRILDELVLPFQELQIDDNEYAYLKAIIFFDPDAKGLSDPGKIKRLRSQVQVSLEDYINDRQYDSRGRFGELLLLLPTLQSITWQMIEQIQFIKLFGMAKIDNLLQEMLLGGSPSDAPHAHHPLHPHLMQEHMGTNVIVANTMPTHLSNGQMCEWPRPRGQAATPETPQPSPPGGSGSEPYKLLPGAVATIVKPLSAIPQPTITKQEVI",
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 146,
                            "beg_index": 0,
                            "length": 233
                        }
                    ]
                },
                {
                    "sequence": "SSYELASLPSINALLQAEVLSRQITSPVSGINGDIRAKKIASIADVCESMKEQLLVLVEWAKYIPAFCELPLDDQVALLRAHAGEHLLLGATKRSMVFKDVLLLGNDYIVPRHCPELAEMSRVSIRILDELVLPFQELQIDDNEYAYLKAIIFFDPDAKGLSDPGKIKRLRSQVQVSLEDYINDRQYDSRGRFGELLLLLPTLQSITWQMIEQIQFIKLFGMAKIDNLLQEMLLGGS",
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 5,
                            "beg_index": 0,
                            "length": 21
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 32,
                            "beg_index": 27,
                            "length": 206
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 21,
                            "length": 6
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 1.1,
                        "type": "RMSD"
                    },
                    {
                        "value": 0.47,
                        "type": "TM-score"
                    },
                    {
                        "value": 638.55,
                        "type": "similarity-score"
                    },
                    {
                        "value": 1,
                        "type": "sequence-similarity"
                    },
                    {
                        "value": 0.99,
                        "type": "sequence-identity"
                    }
                ],
                "n_aln_residue_pairs": 227,
                "n_modeled_residues": [
                    474,
                    227
                ],
                "seq_aln_len": 233,
                "aln_coverage": [
                    48,
                    100
                ]
            }
        }
    ]
};
const duplicatedAlignment = {"info":{"uuid":"dcc58c64-e606-441f-8c04-372381fb7c0e","status":"COMPLETE"},"meta":{"alignment_mode":"pairwise","alignment_method":"fatcat-rigid"},"results":[{"structures":[{"entry_id":"101M","selection":{"asym_id":"A"}},{"entry_id":"101M","selection":{"asym_id":"A"}}],"structure_alignment":[{"regions":[[{"asym_id":"A","beg_seq_id":1,"beg_index":0,"length":154}],[{"asym_id":"A","beg_seq_id":1,"beg_index":0,"length":154}]],"transformations":[[1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0],[1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]],"summary":{"scores":[{"value":456.0,"type":"similarity-score"},{"value":0.0,"type":"RMSD"}],"n_aln_residue_pairs":154}}],"sequence_alignment":[{"regions":[{"asym_id":"A","beg_seq_id":1,"beg_index":0,"length":154}]},{"regions":[{"asym_id":"A","beg_seq_id":1,"beg_index":0,"length":154}]}],"summary":{"scores":[{"value":1.0,"type":"sequence-identity"},{"value":1.0,"type":"TM-score"},{"value":1.0,"type":"sequence-similarity"},{"value":456.0,"type":"similarity-score"},{"value":0.0,"type":"RMSD"}],"n_aln_residue_pairs":154,"n_modeled_residues":[154,154],"seq_aln_len":154,"aln_coverage":[100,100]}}]};

console.log("Alignment objects", alignment, flexAlignment, alignmentExample, duplicatedAlignment);
class RcsbStructuralAlignmentProvider implements AlignmentCollectorInterface {

    private alignmentResponse: AlignmentResponse | undefined = undefined;
    private readonly alignment: StructureAlignmentResponse;
    private readonly alignmentReference: AlignmentReference;
    constructor(alignment: StructureAlignmentResponse, alignmentReference: AlignmentReference) {
        this.alignment = alignment;
        this.alignmentReference = alignmentReference;
    }

    async collect(requestConfig: AlignmentCollectConfig, filter?: Array<string>): Promise<AlignmentResponse> {
        return new Promise(async (resolve)=>{
            resolve(await this.data());
        });
    }
    async getTargets(): Promise<string[]> {
        return new Promise(async (resolve)=>{
            resolve((await this.data()).target_alignment?.map(ta=>ta?.target_id ?? "NA") ?? [])
        })
    }
    async getAlignmentLength(): Promise<number> {
        return new Promise(async (resolve)=>{
            const ends = (await this.data() ).target_alignment?.map(ta=>ta?.aligned_regions?.[ta?.aligned_regions?.length-1]?.query_end);
            resolve(Math.max(...(ends as number[])))
        })
    }
    async getAlignment(): Promise<AlignmentResponse> {
        return new Promise(async (resolve)=>{
            resolve(this.data());
        });
    }
    private async data(): Promise<AlignmentResponse> {
        if(this.alignmentResponse)
            return this.alignmentResponse;
        return new Promise((resolve)=>{
            alignmentTransform(this.alignment, this.alignmentReference).then(ar=>{
                this.alignmentResponse = ar;
                resolve(ar);
            })
        });
    }

}

class RcsbStructuralTransformProvider {

    private readonly alignment: StructureAlignmentResponse;
    constructor(alignment: StructureAlignmentResponse) {
        this.alignment = alignment;
    }

    get(alignmentIndex: number, pairIndex: number): RigidTransformType[] {

        const res = this.alignment.results?.[alignmentIndex];
        if(res?.structure_alignment.length == 1) {
            return [{
                transform: res.structure_alignment[0].transformations[pairIndex] as TransformMatrixType
            }];
        }else if(res?.structure_alignment.length && res?.structure_alignment.length > 1){
            return res.structure_alignment.map(sa=>({
                transform: sa.transformations[pairIndex] as TransformMatrixType,
                regions: sa.regions?.[pairIndex].map(r=>[r.beg_seq_id,r.beg_seq_id+r.length-1])
            }));
        }else{
            return [{
                transform: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]
            }];
        }
    }

}

class RcsbLoadParamsProvider implements LoadParamsProviderInterface<{entryId: string; instanceId: string;},LoadMolstarInterface<AlignmentTrajectoryParamsType,LoadMolstarReturnType>> {

    private readonly alignment: StructureAlignmentResponse;
    private readonly transformProvider: RcsbStructuralTransformProvider;
    private readonly alignmentReference: AlignmentReference;
    constructor(alignment: StructureAlignmentResponse,alignmentReference: AlignmentReference) {
        this.alignment = alignment;
        this.transformProvider = new RcsbStructuralTransformProvider(alignment);
        this.alignmentReference = alignmentReference;
    }

    get(pdb:{entryId: string; instanceId: string;}): LoadMolstarInterface<AlignmentTrajectoryParamsType,LoadMolstarReturnType> {
        if(!this.alignment.results)
            throw new Error("Alignments results not found");
        const {alignmentIndex,pairIndex, entryId} =  this.alignmentReference.getAlignmentEntry(`${pdb.entryId}${TagDelimiter.instance}${pdb.instanceId}`);
        const res = this.alignment.results[alignmentIndex]
        const structure = res.structures[pairIndex] as StructureEntry & StructureURL;
        const transform = this.transformProvider.get(alignmentIndex, pairIndex);
        const reprProvider = !transform?.length || transform.length == 1 ? AlignmentTrajectoryPresetProvider : FlexibleAlignmentTrajectoryPresetProvider;
        const loadMethod = "url" in structure && structure.url ? LoadMethod.loadStructureFromUrl : LoadMethod.loadPdbId;
        const url: string|undefined = "url" in structure &&structure.url ? structure.url : undefined;

        return {
            loadMethod,
            loadParams: {
                url,
                entryId,
                format: url ? "mmcif" : undefined,
                isBinary: url ? false : undefined,
                id: `${pdb.entryId}${TagDelimiter.instance}${pdb.instanceId}`,
                reprProvider,
                params: {
                    modelIndex: 0,
                    pdb,
                    transform: transform
                }
            }
        }
    }
}

async function alignmentTransform(alignment: StructureAlignmentResponse, alignmentRef: AlignmentReference): Promise<AlignmentResponse> {
    if(!alignment.results)
        return {};
    await mergeAlignments(alignment.results, alignmentRef);
    const out: AlignmentResponse = alignmentRef.buildAlignments();
    const seqs = await alignmentRef.getSequences();
    out.target_alignment?.forEach(ta=>{
        const seq = seqs.find(s=>s.rcsbId===ta?.target_id)?.sequence
        if(seq && ta)
            ta.target_sequence = seq;
    });
    return out;
}

async function mergeAlignments(results: Alignment[], alignmentRef: AlignmentReference): Promise<void> {
    const result = results[0];
    if(!result)
        throw "Results not available";
    await alignmentRef.init( result );
    results.forEach((result,n)=>{
        const alignmentId = alignmentRef.addUniqueAlignmentId(result, n);
        if(result.sequence_alignment)
            alignmentRef.addAlignment(alignmentId, transformToGapedDomain(result.sequence_alignment[0].regions), transformToGapedDomain(result.sequence_alignment[1].regions));
        else if(result.structure_alignment && result.structure_alignment[0].regions && result.structure_alignment[1].regions)
            alignmentRef.addAlignment(alignmentId, transformToGapedDomain(result.structure_alignment[0].regions.flat()), transformToGapedDomain(result.structure_alignment[1].regions.flat()));
    });
}

function transformToGapedDomain(regions: AlignmentRegion[]): (number|undefined)[] {
    const out: (number|undefined)[]  = [];
    let prevRegionEnd = 0;
    regions.forEach(region=>{
        const beg = region.beg_index+1;
        const end = region.beg_index+region.length;
        if(beg > (prevRegionEnd+1)){
            const nGaps = beg - (prevRegionEnd+1);
            out.push(...Array(nGaps).fill(undefined));
        }
        prevRegionEnd = end;
        const seqBeg = region.beg_seq_id;
        const seqEnd = region.beg_seq_id+region.length-1;
        for(let i=seqBeg;i<=seqEnd;i++){
            out.push(i);
        }
    });
    return out;
}

const structuralAlignment: StructureAlignmentResponse = alignmentExample as StructureAlignmentResponse;
//const structuralAlignment: StructureAlignmentResponse = duplicatedAlignment as StructureAlignmentResponse;

const alignmentReference = new AlignmentReference();
export const dataProvider: RcsbModuleDataProviderInterface = {
    alignments: {
        collector: new RcsbStructuralAlignmentProvider(structuralAlignment, alignmentReference),
        context:{
            queryId: "structural-alignment",
            group: GroupReference.MatchingUniprotAccession,
            to: SequenceReference.PdbInstance
        }
    }
};

export const loadParamsProvider = new RcsbLoadParamsProvider(structuralAlignment, alignmentReference);