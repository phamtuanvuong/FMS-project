
export function validateRequired(control, mess) {
    if (control) {
        if (control.value) {
            if (control.value.length > 0) {
                return true;
            }
        }
        control.error = "error";
        control.msg = mess;
        return false;
    }
    return true;
}