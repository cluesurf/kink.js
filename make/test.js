import kink from './example.js';
try {
    throw kink('syntax_error', { foo: 'bar' });
}
catch (e) {
    console.log(e);
}
console.log('done');
//# sourceMappingURL=test.js.map