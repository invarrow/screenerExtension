import pandas as pd
import requests
from bs4 import BeautifulSoup


y_link = "https://www.screener.in/screens/1652356/yab/?sort=market+capitalization&order=desc"
m_Link = y_link
#m_Link = "https://www.screener.in/screens/3/highest-dividend-yield-shares/"
headers = {
'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, ' 'like Gecko) Chrome/80.0.3987.149 Safari/537.36',
'accept-language': 'en,gu;q=0.9,hi;q=0.8',
'accept-encoding': 'gzip, deflate, br'
}


data = []
datas = []
pagen=1
with requests. Session() as s:
    r=s.get(m_Link+ "?limit=50&page=1", headers=headers, timeout=5)
    soup=BeautifulSoup (r.text, 'html.parser')
    #extract header of table
    table=soup.find('table', attrs={'class': 'data-table'})
    table_body=table.find('tbody')
    rows=table_body.find_all('tr')
    for row in rows:
        cols=row.find_all('th')
        cols = [ele.text.strip() for ele in cols]
        data.append([ele for ele in cols if ele])
        datas.append(['ExchCode'])

    print(rows)

    #extract number of page
    for link in soup.find_all('a', { 'class':'ink-900'}):
        pagen=link.get('href').split("&page=") [1]

    #extract rows of table
    for x in range(int(pagen)):
        x=x+1
        print (x)
        s_Link = m_Link + "?limit=50&page=" + str(x)
        r=s.get(s_Link, headers=headers, timeout=5)
        soup=BeautifulSoup (r.text, 'html.parser')
        table=soup.find('table', attrs={'class': 'data-table'})
        table_body=table.find('tbody')
        rows=table_body.find_all('tr')
        for row in rows:
            for a in row.find_all('a'):
                if '/company/' in a['href']:
                    symlink =a.get('href')
                    symcode=symlink.split("/") [2]
                    datas.append([symcode])
                    cols=[ele.text.strip() for ele in cols]
                    data.append([ele for ele in cols if ele])

dfs =pd. DataFrame (datas)
df =pd.DataFrame (data)
print(dfs)

df.dropna(axis=0, how='any', subset=None, inplace=True)

df.insert(2,'ExchCode',dfs.iloc[:,0])
print(df)

df.to_csv('screener.csv', index=False)
