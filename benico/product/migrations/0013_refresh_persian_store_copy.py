from django.db import migrations
from django.utils import timezone


COPY_UPDATES = {
    'hero': {
        'title_fa': ('فراتر از روزمره', 'روزمره را به سبک خودت بپوش'),
        'button_fa': ('کشف مجموعه', 'دیدن مجموعه'),
        'alt_fa': ('تیشرت بنیکو با طرح سیاره', 'تی‌شرت بنیکو با طرح سیاره'),
    },
    'intro': {
        'title_fa': ('بیان تازه‌ای از استایل شما', 'ساده بپوش. خودت باش.'),
        'text_fa': ('طرح‌هایی برای بیان شخصیت شما. مجموعه بنیکو را کشف کنید.', 'تی‌شرت، هودی و دورس؛ برای ترکیب‌های ساده و روزهایی که می‌خواهی خودت باشی. از مجموعه‌های بنیکو، چیزی را انتخاب کن که به سلیقه‌ات نزدیک است.'),
    },
    'editorial_one': {
        'title_fa': ('تیشرت‌ها', 'تی‌شرت‌های بنیکو'),
        'alt_fa': ('تیشرت Infinite بنیکو', 'تی‌شرت Infinite بنیکو'),
    },
    'editorial_two': {
        'title_fa': ('استایل، به شیوه شما', 'یک طرح، هزار ترکیب'),
        'button_fa': ('کشف محصول', 'دیدن محصول'),
    },
    'story': {
        'title_fa': ('شخصیت شما، امضای شما.', 'سلیقهٔ تو، امضای استایل تو.'),
        'button_fa': ('ارتباط با بنیکو', 'گفت‌وگو با بنیکو'),
    },
}


def refresh_copy(apps, schema_editor):
    StoreContent = apps.get_model('product', 'StoreContent')
    for record in StoreContent.objects.using(schema_editor.connection.alias).all():
        changed = False
        for section, fields in COPY_UPDATES.items():
            for field, (old, new) in fields.items():
                if record.content.get(section, {}).get(field) == old:
                    record.content[section][field] = new
                    changed = True
        if changed:
            record.revision += 1
            record.updated_at = timezone.now()
            record.save(update_fields=['content', 'revision', 'updated_at'])


class Migration(migrations.Migration):
    dependencies = [('product', '0012_contentimage_storecontent_alter_item_category_and_more')]
    operations = [migrations.RunPython(refresh_copy, migrations.RunPython.noop)]
