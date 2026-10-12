"""Fill empty catalog copy without changing prices, stock, images or staff edits."""
from django.core.management.base import BaseCommand
from django.db import transaction
from product.models import item


COPY = {
    6999: ('A black oversized graphic tee built around the Money Isn’t the Savior statement. Pair it with loose trousers for a relaxed silhouette.', 'تی‌شرت مشکی اورسایز با طرح Money Isn’t the Savior؛ انتخابی برای ترکیب با شلوار آزاد و استایلی راحت.'),
    7000: ('A black oversized tee with a space-inspired graphic. Let the artwork lead with a simple, relaxed outfit.', 'تی‌شرت مشکی اورسایز با طرح الهام‌گرفته از فضا؛ برای ترکیبی ساده و آزاد که طرح لباس در آن دیده شود.'),
    8101: ('Washed X-Ray Hoodie: a graphic-led layering piece for a casual streetwear outfit. Sample catalog item.', 'هودی Washed X-Ray؛ گزینه‌ای با طرح گرافیکی برای پوشیدن روی تی‌شرت و ساختن استایلی روزمره. محصول نمونهٔ کاتالوگ.'),
    8102: ('Everyday Sweatshirt: a simple crew-neck layer to pair with denim or relaxed trousers. Sample catalog item.', 'دورس Everyday با یقهٔ گرد؛ برای ترکیب با جین یا شلوار آزاد در استایل روزمره. محصول نمونهٔ کاتالوگ.'),
    8103: ('Infinite Graphic Tee: a graphic tee for easy everyday combinations, worn alone or under an open layer. Sample catalog item.', 'تی‌شرت Infinite با طرح گرافیکی؛ برای ترکیب‌های روزمره، به‌تنهایی یا زیر یک لایهٔ باز. محصول نمونهٔ کاتالوگ.'),
}

CARE = ('جنس و درصد الیاف تأیید نشده است؛ پیش از خرید از فروشگاه بپرسید. راهنمای پیشنهادی: طبق برچسب لباس عمل کنید؛ برای محافظت از طرح، لباس را پشت‌ورو بشویید و مستقیماً روی چاپ اتو نکنید.\n\n'
        'Fiber composition is unverified; ask the store before purchasing. Suggested care: follow the garment label, wash inside out to protect the graphic, and avoid ironing directly over the print.')


def size_guide(category, sample):
    instructions = ('لباس را روی سطح صاف اندازه بگیرید و با لباس راحت خود مقایسه کنید. عرض سینه از زیر بغل تا زیر بغل و قد از بالای شانه تا پایین لباس است.\n'
                    'Measure flat and compare with a garment you own. Chest is pit-to-pit; length is shoulder-to-hem.\n')
    if not sample:
        return instructions + 'اندازه‌های واقعی این محصول هنوز تأیید نشده است؛ پیش از انتخاب سایز از فروشگاه بپرسید.\nActual measurements are pending verification; ask the store before choosing a size.'
    rows = [(58,72),(61,75),(64,78)] if category == 't-shirt' else [(60,70),(63,73),(66,76)]
    return ('جدول نمونهٔ تولیدشده؛ اندازه‌های واقعی محصول نیست. واحد: سانتی‌متر؛ عرض سینه / قد.\n'
            'GENERATED SAMPLE CHART — not verified garment measurements. Units: cm; chest width / length.\n' +
            '\n'.join(f'{size}: {chest} / {length}' for size,(chest,length) in zip(('L','XL','XXL'),rows)) + '\n' + instructions)


class Command(BaseCommand):
    help = 'Fill blank details for the five known catalog items; preserve existing content and inventory.'

    @transaction.atomic
    def handle(self, **options):
        count = 0
        for product in item.objects.select_for_update().filter(pk__in=COPY):
            en, fa = COPY[product.pk]
            values = dict(description=fa + '\n\n' + en, materials_care=CARE,
                          size_guide=size_guide(product.category, product.pk >= 8101))
            fields = []
            for field, value in values.items():
                if not getattr(product, field).strip():
                    setattr(product, field, value)
                    fields.append(field)
            if fields:
                product.save(update_fields=fields)
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Filled content for {count} products. Stock, prices and images preserved.'))
