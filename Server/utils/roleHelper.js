function getRole(email){
    
    const emailParts = email.split('@');
    if(emailParts.length !== 2) return null;

    const localParts = emailParts[0].split('.');
    if(localParts.length < 2) return null;

    const role = localParts[1].toLowerCase();

    const allowedRoles = ['admin', 'doctor', 'nurse', 'staff', 'pharmacy'];
    return allowedRoles.includes(role) ? role : null;

};
module.exports = {getRole};