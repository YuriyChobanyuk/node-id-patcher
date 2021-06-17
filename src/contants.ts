export const ATTR_KEY = /[*#@\w\[(][\w\]).-]+(?=[=\s])/;
export const ATTR_VAL = /\\"|"(?:\\"|[^"])*"/g;
export const DATA_TEST_ID_KEY = 'data-test-id';
export const IGNORE_TAGS = ['se-', 'ng-', 'router-'];
export const WHITE_LIST = ['se-button'];
