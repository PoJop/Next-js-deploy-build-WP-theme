document.addEventListener('DOMContentLoaded', () => {
    let json = []
    const root = document.querySelector('.root')
    const css = document.querySelector('.css')
    const js = document.querySelector('.js')
    let nextCode = ''
    let path = ''
    let copyJS =''
    let copyCSS =''

    document.querySelector('.nextConeForm').onsubmit = async (e) => {
        e.preventDefault();
        nextCode = String(e.target[0].value)
        validate()
    };

    document.querySelector('.buildManifestForm').onsubmit = async (e) => {
        e.preventDefault();
        json = [JSON.parse(e.target[0].value.replace(/\s{2,}/g, '').replace(/\r?\n/g, ""))]
        validate()
    };
    
    document.querySelector('.copy_all').onclick = () => {navigator.clipboard.writeText(copyCSS + copyJS)}
    document.querySelector('.copy_js').onclick = () => {navigator.clipboard.writeText(copyJS)}
    document.querySelector('.copy_css').onclick = () => {navigator.clipboard.writeText(copyCSS)}
    
    const validate = () => {
        
        copyJS = ''
        copyCSS = ''
        const state = {
            polyfillFiles: [],
            lowPriorityFiles: [],
            pages: {
                pagesJS: [],
                pagesCSS: [],
            }
        }

        if(json[0] === undefined) return false;
        for (let i = 0; i < Object.keys(json[0]).length; i++) {

            if (Object.keys(json[0])[i] === 'polyfillFiles') {
                let polyfill = json[0]['polyfillFiles']

                polyfill.forEach((e) => {
                    state.polyfillFiles.push(`
                <script defer="" nomodule="" src="/_next/${e}"></script>
                `)
                })
            }

            if (Object.keys(json[0])[i] === 'lowPriorityFiles') {
                let lowPriorityFiles = json[0]['lowPriorityFiles']

                lowPriorityFiles.forEach((e) => {
                    let firstSlash = e.indexOf('/', 0)
                    let secondSlash = e.indexOf('/', ++firstSlash)
                    let f = nextCode.length > 0 ? e.substring(0, firstSlash) + nextCode + e.substring(secondSlash, e.length) : e

                    state.lowPriorityFiles.push(`
                <script src="/_next/${f}" defer=""></script>`)
                })
            }

            if (Object.keys(json[0])[i] === 'pages') {
                let pages = json[0]['pages']

                for (let j = 0; j < Object.keys(pages).length; j++) {

                    pages[`${Object.keys(pages)[j]}`].forEach((page) => {
                        if (page.includes('.js')) state.pages.pagesJS.push(`
                    <script src='/_next/${page}' defer=''></script>`)
                        if (page.includes('.css')) state.pages.pagesCSS.push(`
                    <link rel='preload' href='/_next/${page}' as='style' />
                    <link rel='stylesheet' href='/_next/${page}' data-n-g='' />
                    `)
                    })
                }
                for (let e = 0; e < Object.keys(state.pages).length; e++) {
                    if (e === 2) return false;
                    [...new Set(state.pages[`${Object.keys(state.pages)[e]}`])];
                    state.pages[`${Object.keys(state.pages)[e]}`].filter((item, index) => state.pages[`${Object.keys(state.pages)[e]}`].indexOf(item) === index);
                    state.pages[`${Object.keys(state.pages)[e]}`] = state.pages[`${Object.keys(state.pages)[e]}`].reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], []);
                }
            }
        }

        const arrJS = state.pages.pagesJS.concat(state.polyfillFiles, state.lowPriorityFiles).join()
        const arrCSS = state.pages.pagesCSS.join()
        js.innerText = `${arrJS.replace(/,/g, " ")}`
        css.innerText = `${arrCSS.replace(/,/g, " ")}`
        copyJS = js.innerText
        copyCSS = css.innerText
    }
    validate()
})