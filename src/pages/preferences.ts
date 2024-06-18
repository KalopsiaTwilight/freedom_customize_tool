import html from "./preferences.html"

export async function loadPage() {
    $.LoadingOverlay("show");
    $("#pageContent").html(html);

    const settings = await window.store.get('settings');
    
    $("#pref_wowPath").val(settings.freedomWoWRootDir);
    if (settings.launchWoWAfterPatch) {
        $("#pref_launchWoWAfterPatch").attr('checked', 'true');
    }
    $("#pref_model_race").val(settings.previewCharacter.race);
    $("#pref_model_gender").val(settings.previewCharacter.gender);

    $("#pref_saveBtn").on("click", async function () {
        $.LoadingOverlay("show");
        const settings = await window.store.get('settings');
        settings.freedomWoWRootDir = $("#pref_wowPath").val().toString();
        settings.launchWoWAfterPatch = $("#pref_launchWoWAfterPatch").is(":checked");
        settings.previewCharacter.race = parseInt($("#pref_model_race").val().toString());
        settings.previewCharacter.gender = parseInt($("#pref_model_gender").val().toString());
        settings.previewCharacter.customizations = [];
        await window.store.set('settings', settings);
        $.LoadingOverlay("hide");
    })

    $("#pref_openFolder").on("click", async function () {
        const folders = await window.api.selectFolder();
        if (folders) {
            $("#pref_wowPath").val(folders[0]);
        }
    })

    $.LoadingOverlay("hide");
}