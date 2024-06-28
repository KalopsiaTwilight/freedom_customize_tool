import { 
    ArmorSubclass, GeoSet, GeoSetData, InventoryType, ItemComponentSection, ItemFeatureFlag, SheatheStyle, WeaponSubclass 
} from "../models"

export function inventoryTypeToItemDisplayType(type: InventoryType) {
    switch(type) {
        case InventoryType.Head: { return 0;}
        case InventoryType.Shoulders: { return 1;}
        case InventoryType.Shirt: { return 2;}
        case InventoryType.Chest: { return 3; }
        case InventoryType.Waist: { return 4; }
        case InventoryType.Legs: { return 5; }
        case InventoryType.Feet: { return 6; }
        case InventoryType.Wrists: { return 7; }
        case InventoryType.Hands: { return 8; }
        case InventoryType.Back: { return 10; }
        case InventoryType.Tabard: { return 9; }
        case InventoryType.Quiver: { return 11; }
        case InventoryType.OneHand: { return 11; }
        case InventoryType.TwoHand: { return 11; }
        case InventoryType.Shield: { return 13; }
        case InventoryType.HeldInOffHand: { return 11; }
        case InventoryType.Ranged: { return 12; }
    }
}

export function inventoryTypeToItemId(type: InventoryType) {
    switch(type) {
        case InventoryType.Head: { return 259422;}
        case InventoryType.Shoulders: { return 259423;}
        case InventoryType.Shirt: { return 259424;}
        case InventoryType.Chest: { return 259425; }
        case InventoryType.Waist: { return 259426; }
        case InventoryType.Legs: { return 259427; }
        case InventoryType.Feet: { return 259428; }
        case InventoryType.Wrists: { return 259429; }
        case InventoryType.Hands: { return 259430; }
        case InventoryType.OneHand: { return 259433; }
        case InventoryType.Shield: { return 259435; }
        case InventoryType.Ranged: { return 259437; }
        case InventoryType.Back: { return 259431; }
        case InventoryType.TwoHand: { return 259434; }
        case InventoryType.Tabard: { return 259432; }
        case InventoryType.HeldInOffHand: { return 259436; }
    }
}

export function inventoryTypeToItemSlotName(type: InventoryType) {
    switch(type) {
        case InventoryType.Head: { return "Head";}
        case InventoryType.Shoulders: { return "Shoulders";}
        case InventoryType.Shirt: { return "Shirt";}
        case InventoryType.Chest: { return "Chest"; }
        case InventoryType.Waist: { return "Waist"; }
        case InventoryType.Legs: { return "Legs"; }
        case InventoryType.Feet: { return "Feet"; }
        case InventoryType.Wrists: { return "Wrists"; }
        case InventoryType.Hands: { return "Hands"; }
        case InventoryType.Back: { return "Back"; }
        case InventoryType.Tabard: { return "Tabard"; }
        case InventoryType.OneHand: { return "One Hand"; }
        case InventoryType.TwoHand: { return "Two Hand"; }
        case InventoryType.Shield: { return "Shield"; }
        case InventoryType.OffHand: { return "Off Hand"; }
        case InventoryType.Ranged: { return "Ranged"; }
    }
}

export function isArmorInventoryType(type: InventoryType) {
    switch(type) {
        case InventoryType.Back:
        case InventoryType.Chest:
        case InventoryType.Feet:
        case InventoryType.Hands:
        case InventoryType.Head:
        case InventoryType.Legs:
        case InventoryType.Robe:
        case InventoryType.Shirt:
        case InventoryType.Shoulders:
        case InventoryType.Tabard:
        case InventoryType.Waist:
        case InventoryType.Wrists:
        case InventoryType.HeldInOffHand:
        case InventoryType.Shield:
            return true;
        default:
            return false;
    }
}

export function isWeaponInventoryType(type: InventoryType) {
    switch(type) {
        case InventoryType.MainHand:
        case InventoryType.OffHand:
        case InventoryType.OneHand:
        case InventoryType.TwoHand:
            return true;
        default:
            return false;
    }
}

export function inventoryTypeToItemClassId(type: InventoryType) {
    switch (type) {
        case InventoryType.Head: return 4;
        case InventoryType.Neck: return 4;
        case InventoryType.Shoulders: return 4;
        case InventoryType.Shirt: return 4;
        case InventoryType.Chest: return 4;
        case InventoryType.Waist: return 4;
        case InventoryType.Legs: return 4;
        case InventoryType.Feet: return 4;
        case InventoryType.Legs: return 4;
        case InventoryType.Wrists: return 4;
        case InventoryType.Hands: return 4;
        case InventoryType.Finger: return 4;
        case InventoryType.Trinket: return 4;
        case InventoryType.OneHand: return 2;
        case InventoryType.Shield: return 4;
        case InventoryType.Shield: return 2;
        case InventoryType.Back: return 4;
        case InventoryType.TwoHand: return 2;
        case InventoryType.Tabard: return 4;
        case InventoryType.Robe: return 4;
        case InventoryType.MainHand: return 2;
        case InventoryType.OffHand: return 2;
        case InventoryType.HeldInOffHand: return 4;
    }
}

export function itemFeatureFlagToName(flag: ItemFeatureFlag)
{
    switch(flag) {  
        case ItemFeatureFlag.EmblazonedTabard: return "Emblazoned Tabard";
        case ItemFeatureFlag.NoSheathedKit: return "No sheathed kit during spell combat anims";
        case ItemFeatureFlag.HidePantsAndBelt: return "Hide Pants and Belt";
        case ItemFeatureFlag.EmblazonedTabardRare: return "Emblazoned Tabard (Rare)";
        case ItemFeatureFlag.EmblazonedTabardEpic: return "Emblazoned Tabard (Epic)";
        case ItemFeatureFlag.UseSpearRangedWeaponAttachment: return "Use Spear Ranged Weapon Attachment";
        case ItemFeatureFlag.InheritCharacterAnimation: return "Inherit character animation";
        case ItemFeatureFlag.MirrorAnimasFomRightShoulderToLeft: return "Mirror Animation from Right Shoulder to Left";
        case ItemFeatureFlag.MirrorModelWhenEquippedonOffHand: return "Mirror Model When Equipped on Off-Hand";
        case ItemFeatureFlag.DisableTabardGeo: return "Disable Tabard Geo (waist only)";
        case ItemFeatureFlag.MirrorModelWhenEquippedonMainHand: return "Mirror Model When Equipped on Main -Hand";
        case ItemFeatureFlag.MirrorModelWhenSheathed: return "Mirror Model When Sheathed (Warglaives)";
        case ItemFeatureFlag.FlipModelWhenSheathed: return "Flip Model When Sheathed";
        case ItemFeatureFlag.UseAlternateWeaponTrailEndpoint: return "Use Alternate Weapon Trail Endpoint";
        case ItemFeatureFlag.ForceSheathedifequippedasweapon: return "Force Sheathed if equipped as weapon";
        case ItemFeatureFlag.DontCloseHands: return "Don't close hands";
        case ItemFeatureFlag.ForceUnsheathedforSpellCombatAnims: return "Force Unsheathed for Spell Combat Anims";
        case ItemFeatureFlag.BrewmasterUnsheathe: return "Brewmaster Unsheathe";
        case ItemFeatureFlag.HideBeltBuckle: return "Hide Belt Buckle";
        case ItemFeatureFlag.NoDefaultBowstring: return "No Default Bowstring";
        case ItemFeatureFlag.UnknownEffect1: return "Unknown Effect 1";
        case ItemFeatureFlag.UnknownEffect2: return "Unknown Effect 2";
        case ItemFeatureFlag.UnknownEffect3: return "Unknown Effect 3";
        case ItemFeatureFlag.UnknownEffect4: return "Unknown Effect 4";
        case ItemFeatureFlag.UnknownEffect5: return "Unknown Effect 5";
        case ItemFeatureFlag.UnknownEffect6: return "Unknown Effect 6";
        case ItemFeatureFlag.UnknownEffect7: return "Unknown Effect 7";
        case ItemFeatureFlag.UnknownEffect8: return "Unknown Effect 8";
    }
}

export function componentSectionToName(section: ItemComponentSection) {
    switch (section) {
        case ItemComponentSection.UpperArm: return "Upper Arm";
        case ItemComponentSection.LowerArm: return "Lower Arm";
        case ItemComponentSection.Hand: return "Hand";
        case ItemComponentSection.UpperTorso: return "Upper Torso";
        case ItemComponentSection.LowerTorso: return "Lower Torso";
        case ItemComponentSection.UpperLeg: return "Upper Leg";
        case ItemComponentSection.LowerLeg: return "Lower Leg";
        case ItemComponentSection.Foot: return "Foot";
        case ItemComponentSection.Accessory: return "Accesory";
        case ItemComponentSection.Cloak: return "Cloak";
    }
}

export function getGeoSetDataForGeoset(set: GeoSet): GeoSetData {
    switch (set) {
        case GeoSet.Hair: return ({
                title: "Hair",
                options: []
            });
        case GeoSet.Facial: return ({
            title: "Beard / Facial1",
            options: []
        });
        case GeoSet.Facial2: return ({
            title: "Sideburns / Facial2",
            options: []
        });
        case GeoSet.Facial3: return ({
            title: "Moustache / Facial3",
            options: []
        });
        case GeoSet.Wrists: return ({
            title: "Wrists",
            options: [
                {
                    name: "None",
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
        });
        case GeoSet.Boots: return ({
            title: "Boots",
            options: [
                {
                    name: "None",
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
        });
        case GeoSet.Shirt: return ({
            title: "Shirt",
            options: []
        });
        case GeoSet.Ears: return ({
            title: "Ears",
            options: []
        });
        case GeoSet.Sleeves: return ({
            title: "Sleeves",
            options: [
                {
                    name: "Default",
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
        });
        case GeoSet.Legcuffs: return ({
            title: "Legcuffs",
            options: [
                {
                    name: "Default",
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
        });
        case GeoSet.ShirtDoublet: return ({
            title: "Shirt Doublet",
            options: [
                {
                    name: "Default",
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
        });
        case GeoSet.PantDoublet: return ({
            title: "Pant Doublet",
            options: [
                {
                    name: "Default",
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
        });
        case GeoSet.Tabard: return ({
            title: "Tabard",
            options: [
                {
                    name: "Default",
                    value: 0
                },
                {
                    name: "Tabard",
                    value: 1
                }
            ]
        });
        case GeoSet.LowerBody: return ({
            title: "Lower Body",
            options: [
                {
                    name: "None",
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
        });
        case GeoSet.Loincloth: return ({
            title: "DH/Pandaren F Loincloth",
            options: []
        });
        case GeoSet.Cloak: return ({
            title: "Cloak",
            options: [
                {
                    name: "None",
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
        });
        case GeoSet.FacialJewelry: return ({
            title: "Facial Jewelry",
            options: []
        });
        case GeoSet.EyeEffects: return ({
            title: "Eye Effects",
            options: []
        });
        case GeoSet.Belt: return ({
            title: "Belt",
            options: [
                {
                    name: "None",
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
        });
        case GeoSet.SkinTail: return ({
            title: "Skin (Bone/Tail)",
            options: []
        });
        case GeoSet.Feet: return ({
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
        });
        case GeoSet.Head: return ({
            title: "Head",
            options: [
                {
                    name: "None",
                    value: -1
                },
                {
                    name: "Show Head",
                    value: 0
                }
            ]
        });
        case GeoSet.Torso: return ({
            title: "Torso",
            options: [
                {
                    name: "None",
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
        });
        case GeoSet.HandAttachments: return ({
            title: "Hand Attachments",
            options: [
                {
                    name: "None",
                    value: -1
                },
                {
                    name: "Default",
                    value: 0
                }
            ]
        });
        case GeoSet.HeadAttachments: return ({
            title: "Head Attachments",
            options: []
        });
        case GeoSet.Facewear: return ({
            title: "Facewear",
            options: []
        });
        case GeoSet.Shoulders: return ({
            title: "Shoulders",
            options: [
                {
                    name: "None",
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
        });
        case GeoSet.Helmet: return ({
            title: "Helmet",
            options: [
                {
                    name: "None",
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
        });
        case GeoSet.ArmUpper: return ({
            title: "Arm Upper",
            options: [
                {
                    name: "None",
                    value: -1
                },
                {
                    name: "Default",
                    value: 0
                }
            ]
        });
        case GeoSet.ArmReplace: return ({
            title: "Arms Replace",
            options: []
        });
        case GeoSet.LegsReplace: return ({
            title: "Legs Replace",
            options: []
        });
        case GeoSet.FeetReplace: return ({
            title: "Feet Replace",
            options: []
        });
        case GeoSet.HeadSwapGeoset: return ({
            title: "Head SwapGeoset",
            options: []
        });
        case GeoSet.Eyes: return ({
            title: "Eyes",
            options: []
        });
        case GeoSet.Eyebrows: return ({
            title: "Eyebrows",
            options: []
        });
        case GeoSet.Piercings: return ({
            title: "Piercings/Earrings",
            options: []
        });
        case GeoSet.Necklaces: return ({
            title: "Necklaces",
            options: []
        });
        case GeoSet.Headdress: return ({
            title: "Headdress",
            options: []
        });
        case GeoSet.Tail: return ({
            title: "Tail",
            options: []
        });
        case GeoSet.MiscAccesory: return ({
            title: "Misc. Accessory",
            options: []
        });
        case GeoSet.MiscFeature: return ({
            title: "Misc. Feature",
            options: []
        });
        case GeoSet.Noses: return ({
            title: "Noses (Goblins)",
            options: []
        });
        case GeoSet.HairDecoration: return ({
            title: "Hair decoration (LF Draenei)",
            options: []
        });
        case GeoSet.HornDecoration: return ({
            title: "Horn decoration (HM Tauren)",
            options: []
        });
    }
}

export function armorSubClassToName(subClass: ArmorSubclass) {
    return ArmorSubclass[subClass];
}

export function weaponSubClassToName(subClass: WeaponSubclass) {
    switch(subClass) {
        case WeaponSubclass.AxeOneHand: return "Axe (One-Hand)";
        case WeaponSubclass.AxeTwoHand: return "Axe (Two-Hand)";
        case WeaponSubclass.MaceOneHand: return "Mace (One-Hand)";
        case WeaponSubclass.MaceTwoHand: return "Mace (Two-Hand)";
        case WeaponSubclass.SwordOneHand: return "Sword (One-Hand)";
        case WeaponSubclass.SwordTwoHand: return "Sword (Two-Hand)";
        default: return WeaponSubclass[subClass];
    }
}

export function sheatheStyleToName(sheatheStyle: SheatheStyle) {
    switch (sheatheStyle) {
        default: return SheatheStyle[sheatheStyle];
    }
}