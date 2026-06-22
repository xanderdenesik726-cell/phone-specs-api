const request = require("request-promise");
const cheerio = require("cheerio");
const { json, errorJson } = require("../../utils/response");

// GSMArena's search endpoint returns plain HTML that cheerio can parse, so a
// headless browser is not required. We avoid puppeteer entirely (it cannot run
// on Vercel serverless without bundling Chrome) and fetch the page directly,
// mirroring how brandController scrapes the same site. A browser-like
// User-Agent keeps GSMArena from rejecting the request.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

exports.index = async (req, res) => {
  try {
    const q = req.query.query;
    if (q === undefined || q === "") {
      return errorJson(res, "Please provide query search!");
    }
    const url = `${process.env.BASE_URL}/res.php3?sSearch=${encodeURIComponent(q)}`;

    const htmlResult = await request.get({
      uri: url,
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const $ = cheerio.load(htmlResult);

    const title = $(".article-info-name").text();
    const phones = [];
    $(".makers")
      .children("ul")
      .children("li")
      .each((index, el) => {
        const slug = $(el).children("a").attr("href").replace(".php", "");
        const image = $(el).find("img").attr("src");
        const brNode = $(el).children("a").find("br").get(0);
        const phone_name =
          brNode && brNode.nextSibling ? brNode.nextSibling.nodeValue : "";
        const brand = $(el).children("a").text().replace(phone_name, "");
        phones.push({
          brand,
          phone_name,
          slug,
          image,
          detail: req.protocol + "://" + req.get("host") + "/" + slug,
        });
      });

    return json(res, {
      title,
      phones,
    });
  } catch (error) {
    return errorJson(res, error);
  }
};
