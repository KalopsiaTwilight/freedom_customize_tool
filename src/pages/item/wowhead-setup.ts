export function setUpWowHeadConfig()
{
    if (!window.WH) {
        window.WH = {
            WebP: {
                getImageExtension: () => ".webp"
            }
        }
        window.WH.debug = () => {};
        window.WH.defaultAnimation = `Stand`
        window.WH.Wow = {
            ItemFeatureFlags: {
                1: "Emblazoned Tabard",
                2: "No sheathed kit during spell combat anims",
                4: "Hide Pants and Belt",
                8: "Emblazoned Tabard (Rare)",
                16: "Emblazoned Tabard (Epic)",
                32: "Use Spear Ranged Weapon Attachment",
                64: "Inherit character animation",
                128: "Mirror Animation from Right Shoulder to Left",
                256: "Mirror Model When Equipped on Off-Hand",
                512: "Disable Tabard Geo (waist only)",
                1024: "Mirror Model When Equipped on Main -Hand",
                2048: "Mirror Model When Sheathed (Warglaives)",
                4096: "Flip Model When Sheathed",
                8192: "Use Alternate Weapon Trail Endpoint",
                16384: "Force Sheathed if equipped as weapon",
                32768: "Don't close hands",
                65536: "Force Unsheathed for Spell Combat Anims",
                131072: "Brewmaster Unsheathe",
                262144: "Hide Belt Buckle",
                524288: "No Default Bowstring",
                1048576: "Unknown Effect 1",
                2097152: "Unknown Effect 2",
                4194304: "Unknown Effect 3",
                8388608: "Unknown Effect 4",
                16777216: "Unknown Effect 5",
                33554432: "Unknown Effect 6",
                67108864: "Unknown Effect 7",
                134217728: "Unknown Effect 8",
            },
            Item: {
                INVENTORY_TYPE_HEAD: 1,
                INVENTORY_TYPE_NECK: 2,
                INVENTORY_TYPE_SHOULDERS: 3,
                INVENTORY_TYPE_SHIRT: 4,
                INVENTORY_TYPE_CHEST: 5,
                INVENTORY_TYPE_WAIST: 6,
                INVENTORY_TYPE_LEGS: 7,
                INVENTORY_TYPE_FEET: 8,
                INVENTORY_TYPE_WRISTS: 9,
                INVENTORY_TYPE_HANDS: 10,
                INVENTORY_TYPE_FINGER: 11,
                INVENTORY_TYPE_TRINKET: 12,
                INVENTORY_TYPE_ONE_HAND: 13,
                INVENTORY_TYPE_SHIELD: 14,
                INVENTORY_TYPE_RANGED: 15,
                INVENTORY_TYPE_BACK: 16,
                INVENTORY_TYPE_TWO_HAND: 17,
                INVENTORY_TYPE_BAG: 18,
                INVENTORY_TYPE_TABARD: 19,
                INVENTORY_TYPE_ROBE: 20,
                INVENTORY_TYPE_MAIN_HAND: 21,
                INVENTORY_TYPE_OFF_HAND: 22,
                INVENTORY_TYPE_HELD_IN_OFF_HAND: 23,
                INVENTORY_TYPE_PROJECTILE: 24,
                INVENTORY_TYPE_THROWN: 25,
                INVENTORY_TYPE_RANGED_RIGHT: 26,
                INVENTORY_TYPE_QUIVER: 27,
                INVENTORY_TYPE_RELIC: 28,
                INVENTORY_TYPE_PROFESSION_TOOL: 29,
                INVENTORY_TYPE_PROFESSION_ACCESSORY: 30
            },
            ComponentSections: {
                0: "Upper Arm",
                1: "Lower Arm",
                2: "Hand",
                3: "Upper Torso",
                4: "Lower Torso",
                5: "Upper Leg",
                6: "Lower Leg",
                7: "Foot",
                8: "Accesory",
                12: "Cloak"
            },
            GeoSets: {
                0: {
                    title: "Head",
                    options: []
                },
                1: {
                    title: "Beard / Facial1",
                    options: []
                },
                2: {
                    title: "Sideburns / Facial2",
                    options: []
                },
                3: {
                    title: "Moustache / Facial3",
                    options: []
                },
                4: {
                    title: "Gloves",
                    options: [
                        {
                            name: "No Geoset",
                            value: -1
                        },
                        {
                            name: "Default",
                            value: 0
                        },
                        {
                            name: "Thin",
                            value: 1
                        },
                        {
                            name: "Folded",
                            value: 2
                        },
                        {
                            name: "Thick",
                            value: 3
                        },
                    ]
                },
                5: {
                    title: "Boots",
                    options: [
                        {
                            name: "No Geoset",
                            value: -1
                        },
                        {
                            name: "Default",
                            value: 0
                        },
                        {
                            name: "High Boot",
                            value: 1
                        },
                        {
                            name: "Folded Boot",
                            value: 2
                        },
                        {
                            name: "Puffed",
                            value: 3
                        },
                        {
                            name: "Boot 4",
                            value: 4
                        },
                    ]
                },
                6: {
                    title: "Shirt",
                    options: []
                },
                7: {
                    title: "Ears",
                    options: []
                },
                8: {
                    title: "Sleeves",
                    options: [
                        {
                            name: "No Geoset",
                            value: 0
                        },
                        {
                            name: "Flared Sleeve",
                            value: 1
                        },
                        {
                            name: "Puffy Sleeve",
                            value: 2
                        },
                        {
                            name: "Panda Collar Shirt",
                            value: 3
                        },
                    ]
                },
                9: {
                    title: "Legcuffs",
                    options: [
                        {
                            name: "No Geoset",
                            value: 0
                        },
                        {
                            name: "Flared",
                            value: 1
                        },
                        {
                            name: "Ruffled",
                            value: 2
                        },
                        {
                            name: "Panda Pants",
                            value: 3
                        },
                    ]
                },
                10: {
                    title: "Shirt Doublet",
                    options: [
                        {
                            name: "No Geoset",
                            value: 0
                        },
                        {
                            name: "Doublet",
                            value: 1
                        },
                        {
                            name: "Body 2",
                            value: 2
                        },
                        {
                            name: "Body 3",
                            value: 3
                        },
                    ]
                },
                11: {
                    title: "Pant Doublet",
                    options: [
                        {
                            name: "No Geoset",
                            value: 0
                        },
                        {
                            name: "Mini Skirt",
                            value: 1
                        },
                        {
                            name: "Armored Pants",
                            value: 3
                        }
                    ]
                },
                12: {
                    title: "Tabard",
                    options: [
                        {
                            name: "No Geoset",
                            value: 0
                        },
                        {
                            name: "Tabard",
                            value: 1
                        }
                    ]
                },
                13: {
                    title: "Lower Body",
                    options: [
                        {
                            name: "No Geoset",
                            value: -1
                        },
                        {
                            name: "Default",
                            value: 0
                        },
                        {
                            name: "Long Skirt",
                            value: 1
                        },
                    ]
                },
                14: {
                    title: "DH/Pandaren F Loincloth",
                    options: []
                },
                15: {
                    title: "Cloak",
                    options: [
                        {
                            name: "No Geoset",
                            value: 0
                        },
                        {
                            name: "Ankle Length",
                            value: 1
                        },
                        {
                            name: "Knee Length",
                            value: 2
                        },
                        {
                            name: "Split Banner",
                            value: 3
                        },
                        {
                            name: "Tapered Waist",
                            value: 4
                        },
                        {
                            name: "Notched Back",
                            value: 5
                        },
                        {
                            name: "Guild Cloak",
                            value: 6
                        },
                        {
                            name: "Split (Long)",
                            value: 7
                        },
                        {
                            name: "Tapered (Long)",
                            value: 8
                        },
                        {
                            name: "Notched (Long)",
                            value: 9
                        },
                    ]
                },
                16: {
                    title: "Facial Jewelry",
                    options: []
                },
                17: {
                    title: "Eye Effects",
                    options: []
                },
                18: {
                    title: "Belt",
                    options: [
                        {
                            name: "No Geoset",
                            value: -1
                        },
                        {
                            name: "Default",
                            value: 0
                        },
                        {
                            name: "Heavy Belt",
                            value: 1
                        },
                        {
                            name: "Panda Cord Belt",
                            value: 2
                        }
                    ]
                },
                19: {
                    title: "Skin (Bone/Tail)",
                    options: []
                },
                20: {
                    title: "Feet",
                    options: [
                        {
                            name: "Toes",
                            value: 0
                        },
                        {
                            name: "Basic Shoes",
                            value: 1
                        },
                    ]
                },
                21: {
                    title: "Head (new)",
                    options: [
                        {
                            name: "No Geoset",
                            value: -1
                        },
                        {
                            name: "Show Head",
                            value: 0
                        }
                    ]
                },
                22: {
                    title: "Torso",
                    options: [
                        {
                            name: "No Geoset",
                            value: -1
                        },
                        {
                            name: "Default",
                            value: 0
                        },
                        {
                            name: "Covered Torso",
                            value: 1
                        }
                    ]
                },
                23: {
                    title: "Hand Attachments",
                    options: [
                        {
                            name: "No Geoset",
                            value: -1
                        },
                        {
                            name: "Default",
                            value: 0
                        }
                    ]
                },
                24: {
                    title: "Head Attachments",
                    options: []
                },
                25: {
                    title: "Facewear",
                    options: []
                },
                26: {
                    title: "Shoulders",
                    options: [
                        {
                            name: "No Geoset",
                            value: -1
                        },
                        {
                            name: "Show Shoulders",
                            value: 0
                        },
                        {
                            name: "Non-Mythic Only",
                            value: 1
                        },
                        {
                            name: "Mythic",
                            value: 2
                        }
                    ]
                },
                27: {
                    title: "Helmet",
                    options: [
                        {
                            name: "No Geoset",
                            value: -1
                        },
                        {
                            name: "Helm 1",
                            value: 0
                        },
                        {
                            name: "Non-Mythic only",
                            value: 2
                        },
                        {
                            name: "Mythic",
                            value: 3
                        },
                    ]
                },
                28: {
                    title: "Arm Upper",
                    options: [
                        {
                            name: "No Geoset",
                            value: -1
                        },
                        {
                            name: "Default",
                            value: 0
                        }
                    ]
                },
                29: {
                    title: "Arms Replace",
                    options: []
                },
                30: {
                    title: "Legs Replace",
                    options: []
                },
                31: {
                    title: "Feet Replace",
                    options: []
                },
                32: {
                    title: "Head SwapGeoset",
                    options: []
                },
                33: {
                    title: "Eyes",
                    options: []
                },
                34: {
                    title: "Eyebrows",
                    options: []
                },
                35: {
                    title: "Piercings/Earrings",
                    options: []
                },
                36: {
                    title: "Necklaces",
                    options: []
                },
                37: {
                    title: "Headdress",
                    options: []
                },
                38: {
                    title: "Tail",
                    options: []
                },
                39: {
                    title: "Misc. Accessory",
                    options: []
                },
                40: {
                    title: "Misc. Feature",
                    options: []
                },
                41: {
                    title: "Noses (Goblins)",
                    options: []
                },
                42: {
                    title: "Hair decoration (LF Draenei)",
                    options: []
                },
                43: {
                    title: "Horn decoration (HM Tauren)",
                    options: []
                },
            }
        }
    }
}

