# VIVID ART 배포

1. 이 폴더 전체를 GitHub 저장소 루트에 업로드
2. Cloudflare Pages → Create project → GitHub 저장소 연결
3. Framework preset: None / Build command: 비움 / Output directory: /
4. 프로젝트 이름: vividart → https://vividart.pages.dev

도메인을 따로 연결하면 sitemap.xml, rss.xml, robots.txt, index.html 안의 https://vividart.pages.dev 를 새 주소로 바꿔주세요.

## 편집 모드

- 주소: https://vividart.pages.dev/edit (비밀번호는 Cloudflare 비밀값 `CMS_PASSWORD`)
- 저장하면 `content/text.json`, `content/media.json` 과 `assets/uploads/` 에 커밋 1개로 기록됩니다.
