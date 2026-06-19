# Blog

Sade, minimal kişisel blog. GitHub Pages'te ücretsiz barındırılabilir.

## Yeni yazı ekleme

`posts.json` dosyasını aç, listeye şu şekilde yeni bir nesne ekle:

```json
{
  "slug": "yazinin-url-adi",
  "title": "Yazının Başlığı",
  "date": "2026-06-19",
  "body": "İlk paragraf.\n\nİkinci paragraf. Paragrafları boş satırla (\\n\\n) ayır."
}
```

Kurallar:
- `slug`: URL'de görünecek kısım, Türkçe karakter/boşluk kullanma (örn. `ilk-yazim`)
- `date`: `YIL-AY-GUN` formatında (örn. `2026-06-19`)
- `body`: Paragrafları `\n\n` ile ayır

Dosyayı kaydet, değişiklikleri GitHub'a gönder (commit + push). Başka hiçbir dosyaya dokunmana gerek yok.

## GitHub Pages'te yayınlama

1. Bu dosyaları bir GitHub reposuna yükle (örn. `kullaniciadi.github.io` adında bir repo açarsan otomatik olarak `https://kullaniciadi.github.io` adresinde yayınlanır)
2. Repo ayarlarından **Settings → Pages** kısmına gir
3. **Source** olarak `main` branch'i seç, kaydet
4. Birkaç dakika içinde site canlıya çıkar

## Yerelde test etme

Dosyaları doğrudan tarayıcıda açmak çalışmaz (fetch güvenlik kısıtlaması). Basit bir yerel sunucu çalıştır:

```bash
python3 -m http.server 8000
```

Sonra tarayıcıda `http://localhost:8000` adresine git.

## Dosya yapısı

```
index.html    → Ana sayfa, yazı listesi
post.html     → Tekil yazı sayfası
style.css     → Tüm görünüm
posts.json    → Yazıların tutulduğu yer (sadece burayı düzenle)
```
