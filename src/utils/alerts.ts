import { Toast } from "bootstrap";

export function notifySuccess(msg: string, header = 'Success!', autoHide = true) {
    makeAlert(msg, 'success', header, autoHide);
}

export function notifyError(msg: string, header = 'Error!', autoHide = true)
{
    makeAlert(msg, 'danger', header, autoHide);
}

export function notifyInfo(msg: string, header = 'Info:', autoHide = true) {
    makeAlert(msg, 'info', header, autoHide);
}

export function notifyWarning(msg: string, header = 'Warning!', autoHide = true) {
    makeAlert(msg, 'warning', header, autoHide);
}

function makeAlert(msg: string, type: string, header: string, autohide = true) {
    const delay = 10000;
    const toast = $(`<div class="toast align-items-center text-white bg-${type} border-0" role="alert">`);

    const toastHeader = $("<div class='toast-header'>");
    toastHeader.append(`<strong class='me-auto'>${header}</strong>`)
    const closeBtn = $('<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>');
    toastHeader.append(closeBtn)
    toast.append(toastHeader);
    toast.append(`<div class='toast-body'>${msg}</div>`);
    $(".toast-container").append(toast);

    const bsToast = new Toast(toast[0], { autohide, delay });

    const removeFn = () => {
        bsToast.dispose();
        toast.remove();
    }

    if (autohide) {
        setTimeout(removeFn, delay + 1000)
    } else {
        closeBtn.on('click', () => { setTimeout(removeFn, 1000) });
    }

    bsToast.show();
}