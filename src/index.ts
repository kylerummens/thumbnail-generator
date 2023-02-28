import { createCanvas, Image, Canvas } from 'canvas';
import { readFileSync } from 'fs';
const fs = require("fs");
import axios from 'axios';

const wrapText = (text: string, num_lines = 3, max_line_length = 25) => {
    const words = text.split(' ');
    const lines = [];

    let line = '';

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        if ((line + word + ' ').length > max_line_length) {
            lines.push(line.trim());
            if (lines.length === num_lines) {
                if (i < words.length - 1) {
                    const last_line = lines[lines.length - 1];
                    lines[lines.length - 1] = last_line + '...';
                }
                return lines;
            }
            line = '';
        }

        line += word + ' ';

    }

    if (line.length) lines.push(line.trim());

    return lines;
}

const getPublishedText = (date: Date) => {
    const _month = date.getMonth() + 1;
    const month = _month < 10 ? '0' + _month : _month.toString();

    const _day = date.getDate();
    const day = _day < 10 ? '0' + _day : _day.toString();
    return month + '.' + day + '.' + (date.getFullYear().toString().slice(2))
}

(async () => {
    // Dimensions for the image
    const width = 1200;
    const height = 630;

    const post = {
        title: 'Create a blog with Angular Universal, NestJS, and Supabase',
        author: "Kyle Rummens",
        author_photo_url: 'https://vbwgwexedzhcxpxxnhey.supabase.co/storage/v1/object/public/blog-author-avatars/profile.jpeg',
        author_title: 'Senior Software Engineer, BroadbandHub',
        published_at: new Date('2022-12-27 21:53:15'),
        id: 'create-a-blog-with-angular-universal-nestjs-and-supabase'
    }

    const res = await axios.get(post.author_photo_url, { responseType: 'arraybuffer' });
    //const author_image = await loadImage(res.data);
    const author_image = new Image();
    author_image.src = res.data;

    const lineHeight = 75;
    const logo_width = 40;
    const logo_name_height = 16;
    const padding = 40;
    const date_height = 25;
    const title_height = 50;
    const author_image_width = 90;
    const author_name_height = 25;
    const author_title_height = 16;
    const author_spacing_height = 3;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Background color
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    // Logo top-right corner
    const image = new Image();
    const data = readFileSync('./logo.png');
    image.src = data;
    context.drawImage(image, padding, padding, logo_width, logo_width);
    context.font = `${logo_name_height}pt 'Inter'`;
    context.fillStyle = '#64748b';
    context.fillText(`kylerummens.com`, padding + logo_width + 12, padding + 28);

    // Title 
    context.font = `${title_height}pt 'Roboto'`;
    context.textAlign = "left";
    context.fillStyle = "#334155";

    const lines = wrapText(post.title, 3);
    for (let i = lines.length - 1, j = 0; i >= 0; i--, j++) {
        const line = lines[i];
        context.fillText(line, padding, height - padding - author_image_width - (padding * 1.5) - (lineHeight * j));
    }


    // Date 
    context.font = `${date_height}pt 'Roboto Mono,monospace'`;
    context.textAlign = "left";
    context.fillStyle = "#64748b";
    context.fillText(getPublishedText(post.published_at), padding, height - padding - author_image_width - (padding * 1.5) - (lineHeight * lines.length) - (padding / 4));

    // Author image
    const circle = {
        x: padding,
        y: height - padding - author_image_width,
        radius: author_image_width / 2
    }
    context.save();
    context.beginPath();
    context.arc(circle.x + circle.radius, circle.y + circle.radius, circle.radius, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();

    context.drawImage(author_image, padding, height - padding - author_image_width, author_image_width, author_image_width);
    context.restore();

    // Author name
    const name_title_height = author_name_height + author_title_height + author_spacing_height;
    context.font = `${author_name_height}pt 'Inter'`;
    context.fillStyle = '#334155';
    context.fillText(`${post.author}`, padding + author_image_width + 16, height - padding - name_title_height);

    // Author title
    context.font = `italic ${author_title_height}pt 'Inter'`;
    context.fillStyle = '#64748b';
    context.fillText(`${post.author_title}`, padding + author_image_width + 16, height - padding - author_title_height);

    // Export image
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(`./${post.id}.png`, buffer);
})();