import json
import ast
from string import ascii_letters, digits

output = []

REF_BASE_URI = "http://192-168-1-1-ip.co"
VALID_SP_CHARS = "-._~%"
VALID_CHARS = ascii_letters + digits + VALID_SP_CHARS

def processReference(row):
    out = []

    if 'reference' in row:
        item = REF_BASE_URI + row['reference']
        out.append(item)

    return out

def processProduct(row):

    SUBSTITUTIONS = [
        ['WS325 &#65279;', 'WS325'],
        ['P-660H-T1 v2 \t V3.40', 'P-660H-T1 v2 V3.40'],
        ['TEW-652BRP H W:V1.OR', 'TEW-652BRP'],
        ['TEW-652BRP h w:v3.2r 3.00b13', 'TEW-652BRP']
    ]
    STRING_REPLACEMENTS = [
        ['(??)', ''],
        [' / ', '_'],
        ['&amp;', '%26'],
        ['@', '%40'],
        ['!', '%21'],
        [' ', '_'],
        ['-', '_'],
        ["\'", '%27'],
        ['(', '%28'],
        [')', '%29'],
        [',', ''],
        ["?", ''],
        ['&', '%26'],
        ['+', '%2b'],
        ['/', '_']
    ]

    product = row['model_name']

    for sub in SUBSTITUTIONS:
        if product == sub[0]:
            product = sub[1]

    for rpl in STRING_REPLACEMENTS:
        product = product.replace(rpl[0], rpl[1])

    for char in product:
        if char not in VALID_CHARS:
            print(row['model_name'])

    return product.lower()

def processVendor(row):

    SUBSTITUTIONS = [
        ['ADB / Pirelli', 'pirelli'],
        ['Airlive / Ovislink', 'airlive'],
        ['Inseego / Novatel', 'inseego'],
        ['n a', 'vocore'],
        ['EnGenius / Senao', 'engenius'],
        ['Technicolor / Thomson', 'technicolor']
    ]

    STRING_REPLACEMENTS = [
        ['&amp;', '%26'],
        ['@', '%40'],
        [' ', '_'],
        ['-', '_'],
        ["\'", '%27'],
        ['(', '%28'],
        [')', '%29'],
        ['+', '%2b']
    ]

    vendor = row['brand_name']

    for sub in SUBSTITUTIONS:
        if vendor == sub[0]:
            vendor = sub[1]

    for rpl in STRING_REPLACEMENTS:
        vendor = vendor.replace(rpl[0], rpl[1])

    for char in vendor:
        if char not in VALID_CHARS:
            print(vendor)

    return vendor.lower()

def processRow(row):
    out = {}
    out['username'] = row['username'].replace('n/a', '').replace("(blank)", '')
    out['password'] = row['password'].replace('n/a', '').replace("(blank)", '')
    out['part'] = 'a'
    out['vendor'] = processVendor(row)
    out['product'] = processProduct(row)
    out['version'] = 'a'
    out['update'] = 'a'
    out['edition'] = 'a'
    out['language'] = 'a'
    out['protocol'] = 'Unknown'
    out['references'] = processReference(row)

    return out

with open('output', 'r') as f:
    for line in f:
        #print("%s" % (line))

        try:
            line = ast.literal_eval(line)
            output.append(processRow(line))
        except Exception as e:
            print(e)


output = '''\

var data = %s;

module.exports = {
  data,
};
''' % output

with open('data.js', 'w') as f:
    f.write(output)

