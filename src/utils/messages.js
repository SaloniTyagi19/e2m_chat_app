class message {
    // Error
    static NOT_FOUND_URL = 'Bad request';
    static AUTHENTICATE = "Please authenticate";
    static SIGNUP_ERROR = '# already registered';
    static LOGIN_ERROR = 'You need to first SignUp';
    static INVALID_PASSWORD = 'Username/password mismatch';
    static PROVIDE_INPUT = `Please provide #`;
    static VALID_INPUT = `Please provide valid #`;
    static MIN_LENGTH = `# should have atleast 1 item`
    static NOT_FOUND = `# not found`
    static TOKEN_EXPIRED = 'Token has expired.'
    static ACCESS_DENIED = 'Not allowed to perfom this action.'
    static INVALID_PATTERN ='Password should match 8 minimum characters, with 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';
    // Success
    static USER_CREATED = 'User SignUp successfully';
    static USER_LOGIN = '# Login Successfully';
    static ACTION = '# * Successfully';
    static FOUND = `# found successfully`;
    static UPDATED = `# updated successfully`;
    static CREATED = '# created successfully';
}
export default message