require 'spec_helper'
require 'pageflow/editor_controller_test_helper'

module PageflowScrolled
  RSpec.describe Editor::SectionsController, type: :controller do
    include Pageflow::EditorControllerTestHelper

    routes { PageflowScrolled::Engine.routes }

    describe '#create' do
      it 'requires authentication' do
        entry = create(:entry)
        chapter = create(:scrolled_chapter, revision: entry.draft)

        post(:create,
             params: {
               entry_id: entry,
               chapter_id: chapter,
               section: attributes_for(:section)
             }, format: 'json')

        expect(response.status).to eq(401)
      end

      it 'succeeds for authorized user' do
        entry = create(:entry)
        chapter = create(:scrolled_chapter, revision: entry.draft)

        authorize_for_editor_controller(entry)
        post(:create,
             params: {
               entry_id: entry,
               chapter_id: chapter,
               section: attributes_for(:section)
             }, format: 'json')

        expect(response.status).to eq(201)
      end

      it 'allows setting the sections configuration hash' do
        entry = create(:entry)
        chapter = create(:scrolled_chapter, revision: entry.draft)

        authorize_for_editor_controller(entry)
        post(:create,
             params: {
               entry_id: entry,
               chapter_id: chapter,
               section: {
                 configuration: {title: 'A title'}
               }
             }, format: 'json')

        expect(chapter.sections.first.configuration).to eq('title' => 'A title')
      end
    end

    describe '#update' do
      it 'allows updating the sections configuration hash' do
        entry = create(:entry)
        section = create(:section, revision: entry.draft)

        authorize_for_editor_controller(entry)
        patch(:update,
              params: {
                entry_id: entry,
                id: section,
                section: {
                  configuration: {title: 'A title'}
                }
              }, format: 'json')

        expect(section.reload.configuration).to eq('title' => 'A title')
      end

      it 'does not allow updating a section from a different entry' do
        entry = create(:entry)
        create(:section, revision: entry.draft)
        other_entry = create(:entry)
        other_section = create(:section, revision: other_entry.draft)

        authorize_for_editor_controller(entry)
        expect {
          patch(:update,
                params: {
                  entry_id: entry,
                  id: other_section,
                  chapter: {
                    configuration: {title: 'another title'}
                  }
                }, format: 'json')
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    describe '#order' do
      it 'updates position of sections according to given params order' do
        entry = create(:entry)
        chapter = create(:scrolled_chapter, revision: entry.draft)
        sections = create_list(:section, 2, chapter: chapter)

        authorize_for_editor_controller(entry)

        put(:order,
            params: {
              entry_id: entry,
              chapter_id: chapter,
              ids: [sections.first.id, sections.last.id]
            }, format: 'json')

        expect(sections.first.reload.position).to eq(0)
        expect(sections.last.reload.position).to eq(1)
      end

      it 'allows moving a section from one chapter to another within the same entry' do
        entry = create(:entry)
        revision = entry.draft
        chapter = create(:scrolled_chapter, revision: revision)
        section = create(:section, chapter: chapter)
        other_chapter = create(:scrolled_chapter, revision: revision)

        authorize_for_editor_controller(entry)

        put(:order,
            params: {
              entry_id: entry,
              chapter_id: other_chapter,
              ids: [section.id]
            }, format: 'json')

        expect(section.reload.chapter).to eq(other_chapter)
      end
    end

    describe '#destroy' do
      it 'deletes the section' do
        entry = create(:entry)
        section = create(:section, revision: entry.draft)
        chapter = section.chapter

        authorize_for_editor_controller(entry)
        delete(:destroy,
               params: {
                 entry_id: entry,
                 id: section
               }, format: 'json')

        expect(chapter).to have(0).sections
      end

      it 'does not allow deleting a section from a different entry' do
        entry = create(:entry)
        create(:section, revision: entry.draft)
        other_entry = create(:entry)
        other_section = create(:section, revision: other_entry.draft)

        authorize_for_editor_controller(entry)
        expect {
          delete(:destroy,
                 params: {
                   entry_id: entry,
                   id: other_section
                 }, format: 'json')
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
