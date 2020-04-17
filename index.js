/**
 * Router to return a response for the root route
 * */
const Router = require('./router')

/**
 * URL to the main site which contains both URL variants
 * */
const variantsURL = new URL('https://cfw-takehome.developers.workers.dev/api/variants')

/**
 * HTMLRewriter to transform the response received from the fetch call.
 * Rewrites only 'title','h1#title','p#description' and 'a#url' elements.
 * */
const rewriter = new HTMLRewriter()
    .on('title', new TitleRewriter())
    .on('h1#title', new HeadingRewriter())
    .on('p#description', new ParaRewriter())
    .on('a#url', new AnchorRewriter())

/**
 * Event listener for the fetch call.
 *  */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

/**
 * Async function to handle a new request.
 * @param {any} request
 */
async function handleRequest(request) {
    const r = new Router()

    //By default the setCookie is false
    setCookie = false;

    //Fetch the URL Variant from saved cookie
    cookieVal = getCookieVal(request)

    //If cookie is not set then randomly select the URL variant and set the cookie value
    if (!cookieVal) {
        //If cookie is not saved then set setCookie to true
        setCookie = true

        //Fetch the variants from the main URL
        res = await fetch(variantsURL.href)

        //Parse JSON response
        json = await res.json()

        //Save the variants to a variable
        variants = json.variants

        //Randomly select a URL with a 50/50 chance in A/B testing methodology
        cookieVal = variants[Math.floor(Math.random() * variants.length)]
    }

    //Fetch The original response from the randomly selected URL variant
    oldResponse = await fetch(cookieVal)

    //Transform the response by rewriting the key elements
    newResponse = rewriter.transform(oldResponse)

    //If cookie is to be set
    if (setCookie) {
        //Find today's date
        timeToExpire = new Date()

        //Set the cookie to expire after 10 days
        timeToExpire.setDate(timeToExpire.getDate() + 10)

        //Add the set-cookie in the header of the transformed response
        newResponse.headers.append('Set-Cookie', `variantUrl=${cookieVal}; Expires=${timeToExpire.toUTCString()}; path=/; HttpOnly; SameSite=Lax`)
    }

    //Set the new Response for get and post calls 
    r.get('/', () => newResponse)
    r.post('/', () => newResponse)

    const resp = await r.route(request)
    return resp
}

/**
 * Helper method to read the required cookie or return null if not present
 * @param {any} request
 */
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

/**
 * TitleRewriter class to prepend my name to the title text
 * */
class TitleRewriter {
    element(element) {
        element.prepend("Shariq's ")
    }
}

/**
 * HeadingRewriter class to prepend my name to the header text
 * */
class HeadingRewriter {
    element(element) {
        element.prepend("Shariq's ")
    }
}

/**
 * ParaRewriter class to set the content of the matched paragraph element
 * */
class ParaRewriter {
    element(element) {
        element.setInnerContent("My version of Cloudflare's full-stack internship challenge.")
    }
}

/**
 * AnchorRewriter class to set the content of the matched anchor element and set it's href to my linkedIn profile
 * */
class AnchorRewriter {
    element(element) {
        element.setAttribute(
            'href',
            'https://www.linkedin.com/in/shariq-ali-666b842a/'
        )
        element.setInnerContent("See Shariq's LinkedIn Profile")
    }
}