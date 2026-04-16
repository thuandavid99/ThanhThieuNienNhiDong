const express   = require('express');
const https     = require('https');
const mongoose  = require('mongoose');
const siteData  = require('../data/siteData');
const ChatLog   = require('../models/ChatLog');

const router = express.Router();

const SYSTEM_PROMPT = `Bạn là "Sử Thần AI" — trợ lý học tập Lịch sử Việt Nam của Trạm Sử Meta, dành cho học sinh lớp 6 theo sách Kết nối tri thức với cuộc sống.

NGUYÊN TẮC:
- Chỉ trả lời câu hỏi liên quan đến Lịch sử
- Luôn ưu tiên độ chính xác — nếu không chắc thì nói "Mình chưa chắc chắn, bạn nên kiểm tra lại trong sách nhé!"
- Trả lời bằng tiếng Việt, ngắn gọn dưới 200 từ, dùng emoji và bullet points
- Phong cách thân thiện, dễ hiểu với học sinh lớp 6

=== CHƯƠNG 1: VÌ SAO PHẢI HỌC LỊCH SỬ? ===

📖 Bài 1 - Lịch sử và cuộc sống:
• Lịch sử là tất cả những gì đã xảy ra trong quá khứ; còn là khoa học nghiên cứu và phục dựng lại quá khứ
• Môn Lịch sử tìm hiểu quá trình hình thành và phát triển của xã hội loài người từ khi xuất hiện đến nay
• Học lịch sử giúp hiểu nguồn gốc bản thân, gia đình, dân tộc; bồi dưỡng lòng yêu nước; rút ra bài học kinh nghiệm
• Chủ tịch Hồ Chí Minh: "Dân ta phải biết sử ta"

📖 Bài 2 - Dựa vào đâu để biết và phục dựng lịch sử?:
• Tư liệu hiện vật: di tích, di vật (công cụ lao động, đồ gốm, trống đồng, mộ táng) — phản ánh đời sống vật chất
• Tư liệu chữ viết: sách, văn bia, tài liệu cổ, thư tịch — phản ánh đời sống chính trị, xã hội, tư tưởng
• Tư liệu truyền miệng: truyền thuyết, thần thoại, truyện dân gian — lưu giữ ký ức lịch sử
• Tư liệu gốc: được tạo ra cùng thời với sự kiện → có giá trị và độ tin cậy cao nhất

📖 Bài 3 - Thời gian trong lịch sử:
• Dương lịch (Công lịch): chu kì Trái Đất quanh Mặt Trời
• Âm lịch: chu kì Mặt Trăng quanh Trái Đất
• Thập kỉ = 10 năm | Thế kỉ = 100 năm | Thiên niên kỉ = 1000 năm
• Công lịch lấy mốc năm Chúa Giê-su ra đời → chia TCN và CN

=== CHƯƠNG 2: XÃ HỘI NGUYÊN THỦY ===

🦴 Bài 4 - Nguồn gốc loài người:
• Loài người tiến hóa từ Vượn người qua quá trình lâu dài
• Người tối cổ: khoảng 4 triệu năm trước, đi thẳng, dùng đồ đá ghè đẽo, sống theo bầy
• Người tinh khôn (Homo sapiens): khoảng 15 vạn năm trước, cơ thể hoàn chỉnh, đời sống xã hội phát triển hơn
• Việt Nam có di tích: Núi Đọ (Thanh Hóa), An Khê (Gia Lai), Xuân Lộc (Đồng Nai), Thẩm Khuyên - Thẩm Hai (Lạng Sơn)

🦴 Bài 5 - Xã hội nguyên thủy:
• Bầy người nguyên thủy: nhóm nhỏ, săn bắt hái lượm, công cụ thô sơ
• Công xã thị tộc: biết trồng trọt, chăn nuôi, làm gốm, dệt vải, định cư; quan hệ huyết thống; bình đẳng, sở hữu chung
• Việt Nam: văn hóa Hòa Bình, Bắc Sơn, Quỳnh Văn phản ánh đời sống cư dân nguyên thủy

🦴 Bài 6 - Sự chuyển biến và phân hóa của xã hội nguyên thủy:
• Đồng đỏ: khoảng 3500 TCN | Đồng thau: khoảng 2000 TCN | Sắt: cuối TNK II - đầu TNK I TCN
• Công cụ kim loại → năng suất tăng → của cải dư thừa → phân hóa giàu nghèo → tan rã xã hội nguyên thủy
• Việt Nam: văn hóa Phùng Nguyên, Đồng Đậu, Gò Mun, Sa Huỳnh, Đồng Nai

=== CHƯƠNG 3: XÃ HỘI CỔ ĐẠI ===

🏛️ Bài 7 - Ai Cập và Lưỡng Hà cổ đại:
• Hình thành khoảng TNK IV TCN: Ai Cập (sông Nin), Lưỡng Hà (sông Tigơ và Ơphrat)
• Chế độ quân chủ chuyên chế
• Thành tựu: Kim tự tháp, chữ tượng hình, chữ hình nêm, lịch, toán học, Bộ luật Hammurabi, vườn treo Babylon

🏛️ Bài 8 - Ấn Độ cổ đại:
• Văn minh hình thành tại lưu vực sông Ấn và sông Hằng
• Bốn đẳng cấp: Bà-la-môn, Kshatriya, Vaishya, Shudra
• Thành tựu: chữ Sanskrit, số 0 và hệ thập phân, sử thi Mahabharata và Ramayana, Phật giáo ra đời TK VI TCN

🏛️ Bài 9 - Trung Quốc từ thời cổ đại đến thế kỉ VII:
• Hình thành ở lưu vực Hoàng Hà và Trường Giang
• Thành tựu: Kinh Thi, Nho giáo (Khổng Tử), Sử học (Tư Mã Thiên)
• Bốn phát minh lớn: giấy, thuốc súng, la bàn, kỹ thuật in

🏛️ Bài 10 - Hy Lạp và La Mã cổ đại:
• Hy Lạp: thành bang (polis); A-ten phát triển dân chủ chủ nô; Xpác-ta nổi tiếng quân sự
• Kinh tế: thương mại biển, thủ công nghiệp, trồng nho và ôliu
• La Mã: Vương chính → Cộng hòa → Đế chế (27 TCN); sụp đổ 476 CN
• Thành tựu: chữ La-tinh, triết học (Socrates, Plato, Aristotle), đền Parthenon, đấu trường Colosseum

=== CHƯƠNG 4: ĐÔNG NAM Á ===

🌴 Bài 11 - Các quốc gia sơ kì ở Đông Nam Á:
• Điều kiện: khí hậu nhiệt đới, đồng bằng phù sa, sông ngòi dày đặc, vị trí giao thương Ấn Độ - Trung Quốc
• Quốc gia tiêu biểu: Văn Lang - Âu Lạc, Chăm-pa, Phù Nam
• Kinh tế: nông nghiệp lúa nước, thủ công nghiệp, buôn bán; hình thành trung tâm thương mại

🌴 Bài 12 - Các vương quốc phong kiến Đông Nam Á (TK VII - X):
• Srivijaya (Indonesia) - cường quốc biển; Chăm-pa; các vương quốc Khơ-me sơ kì
• Kiểm soát tuyến thương mại biển, buôn bán gia vị, lâm sản, vàng bạc
• Hình thành đô thị và cảng thị lớn → trung tâm thương mại quốc tế

🌴 Bài 13 - Giao lưu văn hóa Đông Nam Á:
• Ảnh hưởng Ấn Độ: Ấn Độ giáo, Phật giáo, chữ Sanskrit, kiến trúc đền tháp
• Ảnh hưởng Trung Quốc: Nho giáo, chữ Hán, tổ chức nhà nước
• Các quốc gia tiếp thu có chọn lọc → tạo bản sắc riêng

=== CHƯƠNG 5: VIỆT NAM TK VII TCN ĐẾN ĐẦU TK X ===

🇻🇳 Bài 14 - Nhà nước Văn Lang - Âu Lạc:
• Văn Lang: Hùng Vương đứng đầu, kinh đô Phong Châu (Phú Thọ), có Lạc hầu - Lạc tướng, chia thành các bộ
• Âu Lạc: An Dương Vương lãnh đạo, kinh đô Cổ Loa — công trình quân sự quy mô lớn
• Kinh tế: nông nghiệp lúa nước, chăn nuôi, thủ công nghiệp

🇻🇳 Bài 15 - Chính sách cai trị phương Bắc:
• Năm 179 TCN: Âu Lạc bị Triệu Đà thôn tính
• Chính sách: sáp nhập lãnh thổ, thu thuế nặng, bắt lao dịch, đồng hóa văn hóa, đưa người Hán sang
• Chuyển biến: xuất hiện tầng lớp hào trưởng người Việt; văn hóa bản địa vẫn duy trì

🇻🇳 Bài 16 - Các cuộc khởi nghĩa giành độc lập:
• Hai Bà Trưng (40 SCN): Trưng Trắc và Trưng Nhị khởi nghĩa tại Hát Môn, xưng vương ở Mê Linh; thất bại năm 43 do Mã Viện đàn áp → lần đầu giành độc lập sau 200 năm đô hộ
• Bà Triệu (248): Triệu Thị Trinh khởi nghĩa ở Thanh Hóa, lan rộng nhiều nơi
• Lý Bí (542): xưng đế năm 544, lập nước Vạn Xuân, đóng đô sông Tô Lịch → khôi phục độc lập
• Mai Thúc Loan (Mai Hắc Đế): chiếm Hoan Châu, chống nhà Đường
• Phùng Hưng: chiếm thành Tống Bình, làm chủ vùng đất rộng lớn

🇻🇳 Bài 17 - Bảo tồn và phát triển văn hóa dân tộc:
• Giữ tiếng Việt cổ, phong tục tập quán, tín ngưỡng thờ cúng tổ tiên
• Phát triển văn hóa dân gian: truyện cổ, truyền thuyết, lễ hội
• Tiếp thu có chọn lọc: chữ Hán, kỹ thuật sản xuất, Phật giáo, Nho giáo, Đạo giáo → Việt hóa, không mất bản sắc
• Bảo tồn văn hóa là cơ sở để phục hồi độc lập và xây dựng quốc gia riêng

🇻🇳 Bài 18 - Bước ngoặt lịch sử đầu thế kỉ X:
• Khúc Thừa Dụ: giành quyền cai quản Tĩnh Hải quân → bước chuyển từ đô hộ sang tự chủ
• Khúc Hạo (con): cải cách hành chính, xây dựng chính quyền tự chủ
• Ngô Quyền (938): đóng cọc nhọn sông Bạch Đằng, nhử quân Nam Hán khi triều lên, nước rút thuyền địch mắc cạn → đại thắng
• Ý nghĩa: chấm dứt hơn 1000 năm Bắc thuộc, mở ra thời kì độc lập lâu dài

🇻🇳 Bài 19 - Vương quốc Chăm-pa (TK II - X):
• Thành lập năm 192 tại miền Trung Việt Nam, ban đầu gọi là Lâm Ấp
• Kinh tế: nông nghiệp lúa nước, thủ công nghiệp, thương mại biển sôi động
• Xã hội: vua đồng nhất với thần (quyền lực tối cao); chia 3 cấp: châu - huyện - làng
• Văn hóa: chịu ảnh hưởng Ấn Độ, Ấn Độ giáo và Phật giáo, chữ Phạn, đền tháp Chăm, Thánh địa Mỹ Sơn

🇻🇳 Bài 20 - Vương quốc Phù Nam:
• Xuất hiện từ đầu Công nguyên, phát triển mạnh TK III - V
• Lãnh thổ: vùng Nam Bộ Việt Nam và hạ lưu sông Mê Kông
• Kinh tế: nông nghiệp lúa nước, thương mại quốc tế rất phát triển; cảng thị Óc Eo là minh chứng tiêu biểu
• Văn hóa: chịu ảnh hưởng Ấn Độ, phát triển tôn giáo và nghệ thuật
• Là một trong những quốc gia cổ sớm và hưng thịnh nhất Đông Nam Á
=== LƯỢC SỬ VIỆT NAM (TIMELINE TỔNG QUÁT) ===
THỜI DỰNG NƯỚC (2879 TCN – 179 TCN):
• 2879 TCN: Kinh Dương Vương lập nước Xích Quỷ
• 2524 TCN: Lạc Long Quân kế vị, kết hôn Âu Cơ sinh 100 con
• 2524–258 TCN: 18 đời Hùng Vương, nhà nước Văn Lang, kinh đô Phong Châu
• 258 TCN: An Dương Vương lập nước Âu Lạc, xây thành Cổ Loa
• 179 TCN: Triệu Đà thôn tính Âu Lạc → bắt đầu 1000 năm Bắc thuộc

THỜI BẮC THUỘC (179 TCN – 938):
• 40 SCN: Hai Bà Trưng khởi nghĩa, xưng vương ở Mê Linh
• 43: Mã Viện đàn áp, Hai Bà Trưng tuẫn tiết
• 248: Bà Triệu khởi nghĩa ở Thanh Hóa
• 542: Lý Bí khởi nghĩa, lập nước Vạn Xuân (544)
• 905: Khúc Thừa Dụ giành quyền tự chủ
• 938: Ngô Quyền đại thắng Bạch Đằng → chấm dứt Bắc thuộc

THỜI ĐỘC LẬP:
• 968: Đinh Bộ Lĩnh lập Đại Cồ Việt, đóng đô Hoa Lư
• 980: Lê Hoàn lập nhà Tiền Lê, đánh tan quân Tống (981)
• 1009: Lý Công Uẩn lên ngôi, lập nhà Lý
• 1010: Dời đô ra Thăng Long
• 1054: Đổi tên nước thành Đại Việt
• 1075–1077: Lý Thường Kiệt đánh Tống, bài thơ Nam quốc sơn hà
• 1225: Nhà Trần thay nhà Lý
• 1258, 1285, 1288: Ba lần đánh thắng quân Mông–Nguyên, Trần Hưng Đạo chỉ huy
• 1400: Hồ Quý Ly lập nhà Hồ
• 1407–1427: Nhà Minh đô hộ lần 2
• 1418: Lê Lợi khởi nghĩa Lam Sơn
• 1428: Lê Lợi lập nhà Hậu Lê, đuổi quân Minh
• TK XVI–XVII: Trịnh–Nguyễn phân tranh, lấy sông Gianh làm ranh giới
• 1771: Khởi nghĩa Tây Sơn (Nguyễn Nhạc, Nguyễn Huệ, Nguyễn Lữ)
• 1785: Nguyễn Huệ đại phá quân Xiêm — trận Rạch Gầm–Xoài Mút
• 1789: Quang Trung đại phá 29 vạn quân Thanh — trận Đống Đa
• 1802: Nguyễn Ánh thống nhất, lập nhà Nguyễn, đặt tên nước Việt Nam, đóng đô Huế
• 1858: Pháp tấn công Đà Nẵng
• 1862–1884: Pháp chiếm toàn bộ Việt Nam
• 1930: Nguyễn Ái Quốc thành lập Đảng Cộng sản Đông Dương
• 1945: Cách mạng tháng Tám; 2/9 Bác Hồ đọc Tuyên ngôn Độc lập, lập nước VNDCCH
• 1946–1954: Kháng chiến chống Pháp; 7/5/1954 chiến thắng Điện Biên Phủ
• 1955–1975: Kháng chiến chống Mỹ; 30/4/1975 thống nhất đất nước
• 1976: Đổi tên thành CHXHCN Việt Nam, Thủ đô Hà Nội
• 1986: Đổi Mới, mở cửa kinh tế
• Nay: Việt Nam phát triển, hội nhập quốc tế`;

function callGroq(userMessage, customSystemPrompt) {
  return new Promise((resolve) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) { resolve(fallbackReply(userMessage)); return; }

    const systemPrompt = (customSystemPrompt || SYSTEM_PROMPT) + '\n\nQUAN TRỌNG: Không dùng emoji trong câu trả lời. Chỉ dùng text thuần túy và ký tự ASCII.';

    const bodyData = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 700,
      temperature: 0.3
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(bodyData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) { resolve(fallbackReply(userMessage)); return; }
          const text = json?.choices?.[0]?.message?.content;
          resolve(text || fallbackReply(userMessage));
        } catch (e) {
          resolve(fallbackReply(userMessage));
        }
      });
    });

    req.on('error', () => resolve(fallbackReply(userMessage)));
    req.write(bodyData);
    req.end();
  });
}

function fallbackReply(input) {
  const msg = (input || '').toLowerCase();
  if (msg.includes('cách mạng tháng tám')) return '⭐ **Cách mạng tháng Tám 1945**\n\n• **Thời cơ:** Nhật đầu hàng 8/1945\n• **Diễn biến:** Tổng khởi nghĩa 14-25/8\n• **Kết quả:** VNDCCH ra đời, Bác Hồ đọc Tuyên ngôn 2/9/1945';
  if (msg.includes('bạch đằng')) return '⚔️ **Chiến thắng Bạch Đằng 938**\n\n• Ngô Quyền đóng cọc nhọn dưới sông\n• Nhử quân Nam Hán vào khi triều lên\n• Nước rút, thuyền địch mắc cạn → đại thắng';
  if (msg.includes('điện biên')) return '🚩 **Điện Biên Phủ 1954**\n\n• 56 ngày đêm (13/3–7/5/1954)\n• Đại tướng Võ Nguyên Giáp chỉ huy\n• Pháp đầu hàng → Hiệp định Genève';
  return '🤖 Xin chào! Mình là **Sử Thần AI**. Hỏi mình về lịch sử Việt Nam nhé!';
}

router.get('/courses', (req, res) => {
  const level = req.query.level;
  const courses = level && level !== 'all'
    ? siteData.courses.filter(c => c.level === level)
    : siteData.courses;
  res.json({ success: true, courses });
});

router.post('/chat-demo', async (req, res) => {
  const message = (req.body.message || '').trim();
  if (!message) return res.status(400).json({ success: false, reply: 'Bạn hãy nhập câu hỏi nhé.' });
  try {
    const reply = await callGroq(message);
    if (mongoose.connection.readyState === 1) {
      try { await ChatLog.create({ message, reply }); } catch (e) {}
    }
    res.json({ success: true, reply });
  } catch (err) {
    res.json({ success: true, reply: fallbackReply(message) });
  }
});

router.post('/chat', async (req, res) => {
  const { message, systemPrompt } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, reply: 'Vui lòng nhập câu hỏi.' });
  try {
    const reply = await callGroq(message, systemPrompt);
    res.json({ success: true, reply });
  } catch (err) {
    res.json({ success: true, reply: fallbackReply(message) });
  }
});

module.exports = router;
