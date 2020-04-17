const Router = require('./router')
const variantsURL = new URL('https://cfw-takehome.developers.workers.dev/api/variants')
const rewriter = new HTMLRewriter()
    .on('title', new TitleRewriter())
    .on('h1#title', new HeadingRewriter())
    .on('p#description', new ParaRewriter())
    .on('a#url', new AnchorRewriter())
/**
 * Example of how router can be used in an application
 *  */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

function handler(request) {
    const init = {
        headers: { 'content-type': 'application/json' },
    }
    const body = JSON.stringify({ some: 'json' })
    return new Response(body, init)
}

async function handleRequest(request) {
    const r = new Router()
    // Replace with the approriate paths and handlers
    r.get('.*/bar', () => new Response('responding for /bar'))
    r.get('.*/foo', request => handler(request))
    r.post('.*/foo.*', request => handler(request))
    r.get('/demos/router/foo', request => fetch(request)) // return the response from the origin

    setCookie = false;
    cookieVal = getCookieVal(request)
    if (!cookieVal) {
        setCookie = true
        res = await fetch(variantsURL.href)
        json = await res.json()
        variants = json.variants
        cookieVal = variants[Math.floor(Math.random() * variants.length)]
    }
    oldResponse = await fetch(cookieVal)
    newResponse = rewriter.transform(oldResponse)

    if (setCookie) {
        timeToExpire = new Date()
        timeToExpire.setDate(timeToExpire.getDate() + 10)
        newResponse.headers.append('Set-Cookie', `variantUrl=${cookieVal}; Expires=${timeToExpire.toUTCString()}; path=/; HttpOnly; SameSite=Lax`)
    }

    r.get('/', () => newResponse) // return a default message for the root route
    r.post('/', () => newResponse)

    const resp = await r.route(request)
    return resp
}

function getCookieVal(request) {
    cookies = request.headers.get('Cookie')
    if (cookies) {
        cookies = cookies.split(';')
        for (const cookie of cookies) {
            if (cookie.split('=')[0].trim() === 'variantUrl') {
                return cookie.split('=')[1].trim()
            }
        }
    }
    return null
}

class TitleRewriter {
    element(element) {
        element.prepend("Shariq's ")
    }
}

class HeadingRewriter {
    element(element) {
        element.prepend("Shariq's ")
    }
}

class ParaRewriter {
    element(element) {
        element.setInnerContent("My version of Cloudflare's full-stack internship challenge.")
    }
}

class AnchorRewriter {
    element(element) {
        element.setAttribute(
            'href',
            'https://www.linkedin.com/in/shariq-ali-666b842a/'
        )
        element.setInnerContent("See Shariq's LinkedIn Profile")
    }
}