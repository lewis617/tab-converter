const fs = require('fs');

const content = fs.readFileSync('test.txt').toString();
const rows = content
    .replace(/\|/g, '')
    .split('\n')
    .map(r => r.replace(/\r/g, ''))
    .filter(r => r.trim());

const isChordRow = _r => {
    const r = _r + ' ';
    const res = r.match(/[ABCDEFG]#?b?m?\d?(maj)?(sus)?\d?\s/g);
    if (!res) { return false; }
    if (res.length === 1) {
        return r.trim().split(/\s/).length === 1;
    }
    return true;
}
const getPos = r => {
    const res = [];
    let chord = '';
    for (let i = 0; i < r.length; i += 1) {
        const s = r[i];
        if (s.match(/\S/)) {
            chord += s;
            if (i === r.length - 1 || r[i + 1].match(/\s/)) {
                if (chord.match(/^[ABCDEFG]/)) {
                    res.push({
                        chord,
                        i,
                    });
                }
            }
        } else {
            chord = '';
        }

    }
    return res;
}
const result = [];
rows.forEach((r, ri) => {
    if (isChordRow(r)) {
        // 下面包含歌词的和弦
        if (ri < rows.length - 1 && !isChordRow(rows[ri + 1]) && !rows[ri + 1].match(/\[|:/g)) {
            const chordsWithPos = getPos(r);
            const lyric = rows[ri + 1];
            const lyricList = [];
            let lastPos = 0;
            chordsWithPos.forEach(c => {
                lyricList.push(`${lyric.slice(lastPos, c.i)}[${c.chord}]`);
                lastPos = c.i;
            });
            lyricList.push(lyric.slice(lastPos))
            result.push(lyricList.join('').replace(/\]\[/g, '] ['));
        } else {
            result.push(getPos(r).map(c => `[${c.chord}] `).join(''));
        }
    }
    // 注释
    else if (r.includes('[')) {
        result.push(`{comment: ${r.replace(/\[|\]/g, '')}}`)
    }
});

console.log(result.join('\n'));
