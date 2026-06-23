// 신규 게시 준비분에 대한 GitHub Issue 본문 생성.
// 워크플로가 GITHUB_TOKEN으로 이슈를 만들고 GitHub가 사용자에게 메일 알림.
import { formatKoreanDate } from "./story.mjs";

export function buildIssue(records) {
  const today = formatKoreanDate(new Date().toISOString());
  const title = `📸 ${records.length}장의 새 사진이 게시 준비됨 (${today})`;

  const blocks = records.map((r) => {
    const caption = r.story + "\n\n" + r.hashtags.join(" ");
    return [
      `### ${r.region} · ${r.theme} — ${formatKoreanDate(r.takenAt)}`,
      "",
      "```",
      caption,
      "```",
      "",
      `이미지: \`${r.src}\``,
      "",
    ].join("\n");
  });

  const body = [
    "오늘 새로 정리된 사진의 인스타그램 게시 초안입니다.",
    "휴대폰에서 사진을 저장한 뒤, 아래 캡션을 복사해 Instagram에 직접 공유하세요.",
    "",
    ...blocks,
  ].join("\n");

  return { title, body };
}
