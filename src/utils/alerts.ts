import { Alert } from "bootstrap";

export function notifySuccess(msg: string) {
    makeAlert(msg, 'success');
}

export function notifyError(msg: string)
{
    makeAlert(msg, 'danger');
}

export function notifyInfo(msg: string) {
    makeAlert(msg, 'info');
}

export function notifyWarning(msg: string) {
    makeAlert(msg, 'warning');
}

function makeAlert(msg: string, type: string) {
    const timeout = 5000;
    const alert = $(`<div class="alert alert-${type} alert-dismissible show fade" role="alert">`);
    alert.text(msg);
    alert.append('<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>')
    $("#alertRow").append(alert);
    const bsAlert = new Alert(alert[0]);
    setTimeout(() => {
        // Close alert if it still exists
        if (document.body.contains(alert[0])) {
            bsAlert.close();
        }
    }, timeout);
}