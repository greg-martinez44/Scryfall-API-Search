const {assert} = require("chai");
const {parseQuery} = require("../scripts/main.js");

const query2 = "select * from x where a = b and c = d";
            const query3 = "select * from x where b=m";

describe("QueryBox", () => {
    describe("parseQuery", () => {
        it("finds WHERE clause - starts at 'where' and ends at line (1 condition)", () => {
            const query = "select * from x where y = z";
            const expectedResult = ["y", "=", "z"];

            const {columns, values, tables} = parseQuery(query);

            assert.deepEqual(values, expectedResult);
        });
        it("finds WHERE clause - starts at 'where' and ends at line (2 conditions)", () => {
            const query = "select * from x where a = b and c = d";
            const expected = ["a", "=", "b", "and", "c", "=", "d"];

            const {columns, values, tables} = parseQuery(query);

            assert.deepEqual(values, expected);
        });
        it("finds FROM clause", () => {
            const query = "select * from x where a = c";
            const expected = ["x"];

            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(tables, expected);
        });
        it("finds SELECT clause with no extra commas", () => {
            const query = "select x, y, z from a where d = e";
            const expected = ["x", "y", "z"];

            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(columns, expected);
        });
        it("throws an error if there is no WHERE clause", () => {
            const query = "select * from x";
            const actual = () => parseQuery(query);
            assert.throws(actual, SyntaxError);
        });
        it("maintains commas in WHERE clause only", () => {
            const query = "select x, y, z from a where n = \"m, bbb\"";
            const expectedValues = ["n", "=", "\"m, bbb\""];
            const expectedColumns = ["x", "y", "z"]

            const {columns, values, tables} = parseQuery(query);

            assert.deepEqual(values, expectedValues);
            assert.deepEqual(columns, expectedColumns)
        });
        it("correctly interprets query when no spacing on left of '='", () => {
            const query = "select x, y, z from a where n= m";
            const expected = ["n", "=", "m"];

            const {columns, values, tables} = parseQuery(query);

            assert.deepEqual(values, expected);
        });
        it("correctly interprets query when no spacing on the right of '='", () => {
            const query = "select x, y, z from a where n =m";
            const expected = ["n", "=", "m"];

            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(values, expected);
        });
        it("correctly interprets query when no spacing on either side of '='", () => {

        });
        it("works with multiple conditions", () => {
            const query = "select x, y, z from u where a = n and b = c";
            const expected = ["a", "=", "n", "and", "b", "=", "c"];

            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(values, expected);
        });
        it("correctly interprets multiple conditions when there are no spaces around second '='", () => {
            const query = "select x, y from z where a = b and c= d";
            const expected = ["a", "=", "b", "and", "c", "=", "d"];
            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(values, expected);
        });
    });
});
