async function printApiResults()
{
    const outputArea = document.getElementById("results");
    const results = await callAPI();
    if (results !== "Bad Request")
    {
        outputArea.innerHTML = formatResults(results);
    } else 
    {
        outputArea.innerHTML = (
            "<p><span style='color: red'>No results!</span></p>"
        );
    }
}
async function callAPI(pageNumber=1, retrievedObj=null)
{
    const rawQuery = document.getElementById("query").value;
    const {columns, values, tables} = parseQuery(rawQuery);
    const url = formatURL(values, tables, pageNumber);

    if (!retrievedObj) retrievedObj = [];

    const response = await fetch(url);
    if (response.ok)
    {
        var responseObj = await response.json();
        retrievedObj = retrievedObj.concat(responseObj.data);
        if (responseObj.has_more)
        {
            return await callAPI(++pageNumber, retrievedObj);
        }
        return retrievedObj;
    }
    return "Bad Request";
}

function parseQuery(rawQuery)
{
    const queryTokens = rawQuery.toLowerCase();
    if (!queryTokens.includes("where"))
    {
        throw new SyntaxError("Query must have where clause");
    }

    const selectIndex = queryTokens.indexOf("select");
    const fromIndex = queryTokens.indexOf("from");
    const whereIndex = queryTokens.indexOf("where");

    const queryParams = {
        columns: [selectIndex + "select".length, fromIndex, /,/g, ""],
        tables: [fromIndex + "from".length, whereIndex, null, null],
        values: [whereIndex + "where".length, queryTokens.length, /, /g, "-"]
    };

    for (const clause in queryParams)
    {
        let startIndex = queryParams[clause][0];
        let endIndex = queryParams[clause][1];
        let pattern = queryParams[clause][2] || "";
        let replaceWith = queryParams[clause][3] || "";

        queryParams[clause] = queryTokens
            .slice(startIndex, endIndex)
            .replace(pattern, replaceWith)
            .trim()
            .split(" ");
    }

    queryParams.values = queryParams.values.map(
        (item) => item.replace(/-/g, ", ")
    );
    queryParams.values = parseValues(queryParams.values)
    return queryParams;
}

function valuesNeedSpacing(value)
{
    const pattern = /[!<>]?=|[<>]/g
    return (value.match(pattern)) && value.length > 1;
}

function parseValues(values) {
    const result = [];
    let nextElement;
    do {
        nextElement = null;
        if (values.some((value) => value === "and"))
        {
            let nextAnd = values.indexOf("and");
            nextElement = values.slice(nextAnd + 1);
            values = values.slice(0, nextAnd);
        }
        if (values.some(valuesNeedSpacing))
        {
            const equalityIndex = values.findIndex(valuesNeedSpacing);
            const equalitySymbol = values[equalityIndex]
                .match(/[!<>]?=|[<>]/g)[0];
            const beforeEquals = values.slice(
                null,
                (equalityIndex > 0) ? equalityIndex : 1
            );
            const afterEquals = values.slice(
                (equalityIndex > 0) ? equalityIndex : 1
            );
            if (
                beforeEquals.length === 1
                && beforeEquals[0].includes(equalitySymbol)
            )
            {
                beforeEquals[0] = beforeEquals[0].replace(equalitySymbol, "");
            } else if (beforeEquals[beforeEquals.length-1].includes(equalitySymbol))
            {
                beforeEquals[beforeEquals.length-1] = (
                    beforeEquals[beforeEquals.length-1]
                        .replace(equalitySymbol, "")
                );
            } else
            {
                afterEquals[0] = afterEquals[0].replace(equalitySymbol, "");
            }
            afterEquals.unshift(equalitySymbol);
            values = beforeEquals.concat(afterEquals);
        }
        result.push(values);
        values = nextElement;
    } while (nextElement);
    return result;
}

function formatURL(values, tables, pageNumber)
{
    const urlTable = tables[0];
    let urlQueryString = "";
    while (values.length > 0) {

        let nextEqualSign = values.indexOf("=");
        urlQueryString += `${values[nextEqualSign-1]}%3A`

        let nextAnd = findNextAnd(values);
        let currentValues = values.slice(nextEqualSign+1, nextAnd);
        if (parseInt(currentValues))
        {
            urlQueryString += `${parseInt(currentValues.join(" "))}`;
        } else
        {
            urlQueryString += `'${currentValues.join(" ")}'`;
        }
        values = values.slice(nextAnd+1);
    }
    return (
        `https://api.scryfall.com/${urlTable}/search?`
        + `order=set&q=${urlQueryString}&page=${pageNumber}`
    );
}


function formatResults(results)
{
    let output = "";
    results.forEach((result) =>
    {
        const {name, image, oracleText, color} = resultAttributes(result);

        const imageHTML = (
            `<img class="cardImage" src=${image.small} alt=${name}\
            width="300px" height="400px">`
        );
        const detailsHTML = 
            `<p class="cardName">${name}</p>`
            + `<p class="cardColor">${color}</p>`
            + `<p class="cardText">${oracleText}</p>`;
        output += `<div class="cardResults">${imageHTML}${detailsHTML}</div>`;
    });
    return output;
}

function resultAttributes(result)
{
    return {
        name: result.name || "",
        image: result.image_uris || "",
        oracleText: result.oracle_text || "",
        color: (result.colors) ? result.colors.join("") : ""
    };
}

function findNextAnd(values)
{
    const nextAnd = values.indexOf("and");
    if (nextAnd === -1) return values.length;
    return nextAnd;
}

try {
    module.exports.parseQuery = parseQuery;
} catch (ReferenceError) {

}

