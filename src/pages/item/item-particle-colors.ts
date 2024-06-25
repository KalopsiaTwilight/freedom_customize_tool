import { previewCustomItem } from "./preview-item";

export async function reloadParticleColorComponents() {
    const itemData = await window.store.get('itemData');

    const domTarget = "#particleColorSection .accordion-body";
    $(domTarget).empty();

    if (itemData.particleColors.length > 0) {
        // Set modal colors
        for (let i = 1; i < 4; i++) {
            for (let j = 1; j < 4; j++) {
                const [b, g, r, a] = intToByteArray(itemData.particleColors[i - 1][j - 1]);
                const hexStr = "#" + byteToHexCode(r) + byteToHexCode(g) + byteToHexCode(b);
                $("#ci_particle_color" + i + "_" + j).val(hexStr);
                $("#ci_particle_alpha" + i + "_" + j).val((a / 255).toFixed(2));
            }
        }

        const table = $("<table class='table'>");
        table.append("<thead><tr><th>#<th>Start</th><th>Mid</th><th>End</th></tr></thead>")
        const tbody = $("<tbody>");
        for (let i = 0; i < itemData.particleColors.length; i++) {
            const colorData = itemData.particleColors[i];
            const row = $("<tr>");
            row.append($("<td>" + (i + 1) + "</td>"));
            for (const color of colorData) {
                row.append($("<td><div class='me-2' style='width:50px; height:50px; display: inline-block;background-color: " + getColorStringFromNumber(color) + "'></div></td>"))
            }
            tbody.append(row);
        }
        table.append(tbody);
        $(domTarget).append(table);

    } else {
        for (let i = 1; i < 4; i++) {
            for (let j = 1; j < 4; j++) {
                $("#ci_particle_color" + i + "_" + j).val("#000000");
                $("#ci_particle_alpha" + i + "_" + j).val("1");
            }
        }
        $(domTarget).append("<p>Using default particle generator colors</p>");
    }

    const removeButton = $("<button class='btn btn-outline-danger'>Clear</button>");
    removeButton.on("click", onRemoveParticleColors)

    const btnContainer = $("<div class='d-flex justify-content-between align-items-center'>");
    btnContainer.append($("<button class='btn btn-primary' data-bs-toggle='modal' data-bs-target='#setParticleOverrideModal'>Edit Particle Colors</button>"));
    btnContainer.append(removeButton);
    $(domTarget).append(btnContainer)
}

async function onRemoveParticleColors() {
    const itemData = await window.store.get('itemData');
    itemData.particleColors = [];
    await window.store.set('itemData',itemData);
    await reloadParticleColorComponents();
    await previewCustomItem();
}

export async function onSetParticleColors() {
    const itemData = await window.store.get('itemData');
    itemData.particleColors = [];
    for (let i = 1; i < 4; i++) {
        const colors = [];
        for (let j = 1; j < 4; j++) {
            let colorVal = $("#ci_particle_color" + i + "_" + j).val().toString();
            let a = Math.floor(parseFloat($("#ci_particle_alpha" + i + "_" + j).val().toString()) * 255);
            let r = parseInt(colorVal.substr(1, 2), 16);
            let g = parseInt(colorVal.substr(3, 2), 16);
            let b = parseInt(colorVal.substr(5, 2), 16);
            colors.push(rgbaToInt(r, g, b, a));
        }
        itemData.particleColors.push(colors);
    }
    await window.store.set('itemData',itemData);
    await reloadParticleColorComponents();
    await previewCustomItem();
}

function intToByteArray(input: number) {
    var byteArray = [0, 0, 0, 0];
    for (var i = 0; i < byteArray.length; i++) {
        var byte = input & 0xff;
        byteArray[i] = byte;
        input = (input - byte) / 256;
    }
    return byteArray;
};

function getColorStringFromNumber(input: number) {
    const [b,g,r,a] = intToByteArray(input);

    return `rgba(${r},${g},${b},${(a/255).toFixed(2)})`
}

function byteArrayToInt(byteArray: number[]) {
    var value = 0;
    for (var i = byteArray.length - 1; i >= 0; i--) {
        value = (value * 256) + byteArray[i];
    }
    return value;
};

function rgbaToInt(r: number, g: number, b: number, a: number) {
    return byteArrayToInt([b, g, r, a]);
}

function byteToHexCode(num: number) {
    let code = num.toString(16);
    if (code.length === 1) {
        return '0' + code;
    } else {
        return code;
    }
}