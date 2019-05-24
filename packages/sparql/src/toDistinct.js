export default function SPARQLToDisctinct(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const { head: { vars }, results: { bindings } } = data;

    if (vars.length !== 2) { throw new Error('Result of query should have only two columns !'); }

    const firstVar = vars[0];
    const secondVar = vars[1];


    const returnedData = { total: bindings.length };
    returnedData.data = bindings.map((elem) => {
        const id = elem[firstVar].value;
        const val = Number(elem[secondVar].value);

        // TODO
        if (Number.isNaN(val)) {
            throw new Error('The second column should contains only numbers');
        }

        return {
            _id: id,
            value: val,
        };
    });


    feed.write(returnedData);
    feed.end();
}
