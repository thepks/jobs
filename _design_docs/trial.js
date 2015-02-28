function(head, req) {

    var val = {};
    var val_togo = {};
    var results = [];
    var row;
    var roles = req.userCtx.roles;
    var admi = false;
    var requester = req.userCtx.name;
    for (var v = 0; v < roles.length; v++) {
        if (roles[v] ===
            "_admin" || roles[v] === "jobadmin") {
            admi = true;
        }
    }

    while (row = getRow()) {
        var user = row.key[2];
        var program = row.key[0];

        if (admi || user === requester) {
            var avg = row.value.sum / row.value.count;

            if (!(program in val)) {
                val[program] = [];
            }

            var curr = val[program];
            curr.push(avg);

            val[program] = curr;

        }
    }

    for (var keyval in val) {
        var a = 0;
        var b1 = 0;
        var b2 = 0;
        var b3 = 0;
        var c = 0;
        var d = 0;
        var m = 0;
        for (var i = 0; i < val[keyval].length; i++) {
            a += val[keyval].length * ((i + 1) * val[keyval][i]);
            b2 += val[keyval][i];
            b1 += (i + 1);
            c += (val[keyval].length * val[keyval][i] * val[keyval][i]);
        }
        b3 = b1 * b2;
        d = b1 * b1;
        m = (a - b3) / (c - d);

        val_togo = {};
        val_togo.key = keyval;
        val_togo.value = m;
        results.push(val_togo);
    }

    var res = {};
    res.rows = results;
    send(JSON.stringify(res));
}