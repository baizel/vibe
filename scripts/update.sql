UPDATE products
SET image_url = CASE
    WHEN image_url LIKE '%200x120%' THEN 'https://picsum.photos/200/120?random=' || id
    WHEN image_url LIKE '%200x300%' THEN 'https://picsum.photos/200/300?random=' || id
    -- add more conditions if other sizes exist
    ELSE 'https://picsum.photos/200/120?random=' || id -- fallback default
END;