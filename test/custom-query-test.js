const {assert} = require("chai");
const {parseQuery, formatURL} = require("../scripts/main.js");

// `https://api.scryfall.com/${urlTable}/search?`
// + `order=set&q=${urlQueryString}&page=${pageNumber}`

describe("QueryBox", () => {
    describe("parseQuery", () => {
        it(
            "finds WHERE clause - starts at 'where' and ends"
            + " at line (1 condition)",
            () => {
            const query = "select * from x where y = z";
            const expectedResult = [["y", "=", "z"]];

            const {columns, values, tables} = parseQuery(query);

            assert.deepEqual(values, expectedResult);
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
            const expectedValues = [["n", "=", "\"m, bbb\""]];
            const expectedColumns = ["x", "y", "z"]

            const {columns, values, tables} = parseQuery(query);

            assert.deepEqual(values, expectedValues);
            assert.deepEqual(columns, expectedColumns)
        });
        it("correctly interprets query when no spacing on left of '='", () => {
            const query = "select x, y, z from a where n= m";
            const expected = [["n", "=", "m"]];

            const {columns, values, tables} = parseQuery(query);

            assert.deepEqual(values, expected);
        });
        it(
            "correctly interprets query when no spacing"
            + " on the right of '='",
            () => {
            const query = "select x, y, z from a where n =m";
            const expected = [["n", "=", "m"]];

            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(values, expected);
        });
        it.skip(
            "correctly interprets query when no spacing"
            + " on either side of '='",
            () => {

        });
        it("works with multiple conditions", () => {
            const query = "select x, y, z from u where a = n and b = c";
            const expected = [["a", "=", "n"], ["b", "=", "c"]];

            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(values, expected);
        });
        it("works with three conditions", () => {
            const query = "select x, y from b where s = t and e = f and g = h";
            const expected = [
                ["s", "=", "t"],
                ["e", "=", "f"],
                ["g", "=", "h"]
            ];
            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(values, expected);
        });
        it(
            "correctly interprets multiple conditions when"
            + " there are no spaces around second '='",
            () => {
            const query = "select x, y from z where a = b and c= d";
            const expected = [["a", "=", "b"], ["c", "=", "d"]];
            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(values, expected);
        });
        it("works with '<' operator", () => {
            const query = "select x, y from b where a < b";
            const expected = [["a", "<", "b"]];

            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(values, expected);
        });
        it("works with '>=' operator", () => {
            const query = "select x, y from b where a >= d";
            const expected = [["a", ">=", "d"]];

            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(values, expected);
        })
        it("works with '>' and no space", () => {
            const query = "select x, y from b where a >d";
            const expected = [["a", ">", "d"]];

            const {columns, values, tables} = parseQuery(query);
            assert.deepEqual(values, expected);
        })
    });
    describe("formatURL", () => {
        it("fills in the table from tables item", () => {
            const values = [["x", "=", "c"]];
            const tables = ["cards"];
            const expectedStart = `https://api.scryfall.com/cards/search?`;
            const actual = formatURL(values, tables);

            assert.ok(actual.startsWith(expectedStart));
        });
        it("fills in values with one entry", () => {
            const values = [["x", "=", "c"]];
            const tables = ["cards"];
            const pageNumber = 1;
            const expected = (
                `https://api.scryfall.com/cards/search?`
                + `order=set&q=x%3Dc&page=1`
            );
            const actual = formatURL(values, tables, pageNumber);

            assert.equal(actual, expected);
        });
        it("fills in values with one entry ('<')", () => {
            const values = [["x", "<", "c"]];
            const tables = ["cards"];
            const pageNumber = 1;
            const expected = (
                `https://api.scryfall.com/cards/search?`
                + `order=set&q=x%3Cc&page=1`
            );
            const actual = formatURL(values, tables, pageNumber);
            assert.equal(actual, expected);
        });
        it("fills in values with two entries", () => {
            const values = [["x", "=", "c"], ["b","=", "d"]];
            const tables = ["cards"];
            const pageNumber = 1;
            const expected = (
                `https://api.scryfall.com/cards/search?`
                + `order=set&q=x%3Dc+b%3Dd&page=1`
            );
            const actual = formatURL(values, tables, pageNumber);
            assert.equal(actual, expected);
        });
    });
});
