import test from 'ava';
import { double, power } from './number';
test('double', function (t) {
    t.is(double(2), 4);
});
test('power', function (t) {
    t.is(power(2, 4), 16);
});
//# sourceMappingURL=number.spec.js.map