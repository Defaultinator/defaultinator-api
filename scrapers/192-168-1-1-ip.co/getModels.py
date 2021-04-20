import requests
from bs4 import BeautifulSoup, SoupStrainer
import json

# curl 'https://www.192-168-1-1-ip.co/ajaxData.php' \
#      -H 'authority: www.192-168-1-1-ip.co' \
#         -H 'sec-ch-ua: "Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"' \
#            -H 'accept: */*' \
#               -H 'x-requested-with: XMLHttpRequest' \
#                  -H 'sec-ch-ua-mobile: ?0' \
#                     -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36' \
#                        -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
#                           -H 'origin: https://www.192-168-1-1-ip.co' \
#                              -H 'sec-fetch-site: same-origin' \
#                                 -H 'sec-fetch-mode: cors' \
#                                    -H 'sec-fetch-dest: empty' \
#                                       -H 'referer: https://www.192-168-1-1-ip.co/default-usernames-passwords/' \
#                                          -H 'accept-language: en-US,en;q=0.9' \
#                                             -H 'cookie: __cfduid=d8f03bbd34575c1ecfd60e36c59a2db9a1611357951; _ga=GA1.2.1332046507.1611357953; __gads=ID=c031a4a69e82cdee-226d46dd3cc6009a:T=1611357952:RT=1611357952:S=ALNI_MbhgL4jiELj4te_PrfOZRXGUszcJQ; _gid=GA1.2.217658474.1611617990' \
#                                                --data-raw 'model_id=11015' \
#                                                           --compressed

USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36'
URL = 'https://www.192-168-1-1-ip.co/ajaxData.php'
HEADERS = {'user-agent': USER_AGENT}

#r = requests.post(URL, data=payload, headers=headers)

#print r.content

def merge_two_dicts(x, y):
    if x and y:
        z = x.copy()   # start with x's keys and values
        z.update(y)    # modifies z with y's keys and values & returns None
        return z

def getCredentials(model_id):
    response = {}

    payload = {'model_id': model_id}
    r = requests.post(URL, data=payload, headers=HEADERS)
    html = r.content
    soup = BeautifulSoup(html, 'html.parser')

    try:
        my_table = soup.findChildren('tbody')[0]
        my_rows = my_table.findChildren('tr')

        response['username'] = my_rows[1].findChildren('td')[1].string.encode('ascii', errors='xmlcharrefreplace').strip()
        response['password'] = my_rows[2].findChildren('td')[1].string.encode('ascii', errors='xmlcharrefreplace').strip()
    except Exception as e:
        #print(e)
        return None

    try:
        response['reference'] = my_rows[3].findChildren('td')[1].find('a', href=True)['href'].encode('ascii', errors='xmlcharrefreplace').strip()

    except Exception as e:
        pass
        #print(e)

    return response

def getModels(brand_id):
    models = []

    payload = {'brand_id': brand_id}
    r = requests.post(URL, data=payload, headers=HEADERS)
    html = "<select>"
    html += r.content
    html += "</select>"
    soup = BeautifulSoup(html, 'html.parser')

    for item in soup.find_all('option'):
        if item.get('value') != '':
            models.append({'model_id': int(item.get('value')), 'model_name': item.text.encode('ascii', errors='xmlcharrefreplace')})

    return models

def getManufacturers():
    manufacturers = []

    with open('manufacturers.txt', 'r') as f:
        for line in f:
            (id, name) = line.split('\t')
            manufacturers.append({'brand_id': int(id), 'brand_name': name.rstrip()})

    return manufacturers

with open('responses', 'w') as f:
    for manufacturer in getManufacturers():
        for model in getModels(manufacturer['brand_id']):
            resp1 = merge_two_dicts(getCredentials(model['model_id']), model)
            resp2 = merge_two_dicts(resp1, manufacturer)
            if resp2:
                f.write(json.dumps(resp2))
                print(resp2)

#sprint(getCredentials(5229))
